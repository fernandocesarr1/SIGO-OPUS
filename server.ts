import express, { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { parse, isAfter, isBefore, isEqual, format } from 'date-fns';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// --- CONSTANTS ---

const POSTOS = ['SD', 'CB', '3SGT', '2SGT', '1SGT', 'SUBTEN', '2TEN', '1TEN', 'CAP'] as const;

const AFASTAMENTOS_SEM_EFETIVO_EXERCICIO = [
  'LIC_TRATAR_INT_PARTICULAR',
  'LIC_ACOMP_CONJUGE',
  'LIC_EXERC_ATIV_PRIVADA',
  'PRISAO',
  'AGREGACAO'
];

const CODIGOS_CRITICOS = ['UA', 'PO', 'DV', 'SE'];

// --- UTILS ---

function parseLocalData(dateStr: string): Date {
  // Parsing date strictly as YYYY-MM-DD to avoid timezone shifts
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

async function registrarAuditoria(
  tabela: string,
  registroId: number,
  operacao: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE',
  dadosAnteriores: any,
  dadosNovos: any,
  usuario: string
) {
  await prisma.auditoria.create({
    data: {
      tabela,
      registroId,
      operacao,
      dadosAnteriores: dadosAnteriores ? JSON.parse(JSON.stringify(dadosAnteriores)) : null,
      dadosNovos: dadosNovos ? JSON.parse(JSON.stringify(dadosNovos)) : null,
      usuario
    }
  });
}

// --- VALIDATION SCHEMAS ---

const PolicialSchema = z.object({
  re: z.string().min(1).max(20),
  digito: z.string().max(2).optional(),
  nome: z.string().min(3).max(200),
  nomeGuerra: z.string().min(2).max(100),
  posto: z.enum(POSTOS),
  subunidadeId: z.number().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  dataInclusao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const AfastamentoSchema = z.object({
  policialId: z.number(),
  tipo: z.string(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  indeterminado: z.boolean().default(false),
  documento: z.string().optional(),
  observacao: z.string().optional(),
});

const RestricaoSchema = z.object({
  policialId: z.number(),
  codigos: z.array(z.string().max(5)).min(1),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documento: z.string(),
  parecerMedico: z.string().optional(),
  observacao: z.string().optional(),
});

// --- SERVICES / LOGIC ---

function applyRestrictionRules(codigos: string[]): { finalCodigos: string[], warnings: string[] } {
  let finalCodigos = [...new Set(codigos.map(c => c.toUpperCase()))];
  const warnings: string[] = [];

  // Regra BG PM 232/08: SE implica em UU
  if (finalCodigos.includes('SE') && !finalCodigos.includes('UU')) {
    finalCodigos.push('UU');
    warnings.push('Código UU adicionado automaticamente conforme BG PM 232/08 (SE → UU)');
  }

  const criticos = finalCodigos.filter(c => CODIGOS_CRITICOS.includes(c));
  if (criticos.length > 0) {
    warnings.push(`ATENÇÃO: Códigos críticos presentes: ${criticos.join(', ')}. Impactam severamente o emprego.`);
  }

  return { finalCodigos: finalCodigos.sort(), warnings };
}

async function checkOverlap(policialId: number, dataInicio: string, dataFim?: string, indeterminado?: boolean, excludeId?: number) {
  const start = parseLocalData(dataInicio);
  const end = dataFim ? parseLocalData(dataFim) : null;

  const existing = await prisma.afastamento.findMany({
    where: {
      policialId,
      excluido: false,
      id: { not: excludeId },
    }
  });

  for (const a of existing) {
    const aStart = a.dataInicio;
    const aEnd = a.dataFim;
    const aIndet = a.indeterminado;

    // Logic for overlap detection
    const overlaps = (
      (end && aEnd && !indeterminado && !aIndet) ? !(start > aEnd || aStart > end) :
      (indeterminado || !end) ? (!aEnd || aEnd >= start) :
      (aIndet || !aEnd) ? (!end || end >= aStart) : false
    );

    if (overlaps) return a;
  }
  return null;
}

// --- ROUTES ---

// Policiais
app.post('/api/policiais', async (req: Request, res: Response) => {
  try {
    const data = PolicialSchema.parse(req.body);
    const usuario = req.headers['x-usuario'] as string || 'SISTEMA';

    const policial = await prisma.policial.create({
      data: {
        ...data,
        dataInclusao: data.dataInclusao ? parseLocalData(data.dataInclusao) : null,
        criadoPorUsuario: usuario
      }
    });

    await registrarAuditoria('policiais', policial.id, 'CREATE', null, policial, usuario);

    res.status(201).json({ success: true, data: policial });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Afastamentos
app.post('/api/afastamentos', async (req: Request, res: Response) => {
  try {
    const data = AfastamentoSchema.parse(req.body);
    const usuario = req.headers['x-usuario'] as string || 'SISTEMA';

    // Business Logic: Check overlap
    const conflict = await checkOverlap(data.policialId, data.dataInicio, data.dataFim, data.indeterminado);
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: `CONFLITO: Já existe afastamento no período. Existente: ${conflict.tipo} (${format(conflict.dataInicio, 'dd/MM/yyyy')})`
      });
    }

    const contaEfetivo = !AFASTAMENTOS_SEM_EFETIVO_EXERCICIO.includes(data.tipo);
    const warnings: string[] = [];
    if (!contaEfetivo) warnings.push('⚠️ NÃO conta efetivo exercício para aposentadoria/promoção');

    const afastamento = await prisma.afastamento.create({
      data: {
        ...data,
        dataInicio: parseLocalData(data.dataInicio),
        dataFim: data.dataFim ? parseLocalData(data.dataFim) : null,
        contaEfetivoExercicio: contaEfetivo,
        criadoPorUsuario: usuario
      }
    });

    await registrarAuditoria('afastamentos', afastamento.id, 'CREATE', null, afastamento, usuario);

    res.status(201).json({ success: true, data: afastamento, warnings });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Restrições
app.post('/api/restricoes', async (req: Request, res: Response) => {
  try {
    const data = RestricaoSchema.parse(req.body);
    const usuario = req.headers['x-usuario'] as string || 'SISTEMA';

    const { finalCodigos, warnings } = applyRestrictionRules(data.codigos);

    const restricao = await prisma.restricao.create({
      data: {
        ...data,
        codigos: finalCodigos,
        dataInicio: parseLocalData(data.dataInicio),
        dataFim: parseLocalData(data.dataFim),
        criadoPorUsuario: usuario
      }
    });

    await registrarAuditoria('restricoes', restricao.id, 'CREATE', null, restricao, usuario);

    res.status(201).json({ success: true, data: restricao, warnings });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Dashboard: Vencimentos
app.get('/api/dashboard/vencimentos', async (req: Request, res: Response) => {
  const dias = parseInt(req.query.dias as string) || 7;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje);
  limite.setDate(hoje.getDate() + dias);

  const afastamentos = await prisma.afastamento.findMany({
    where: {
      excluido: false,
      indeterminado: false,
      dataFim: { gte: hoje, lte: limite }
    },
    include: { policial: true }
  });

  const restricoes = await prisma.restricao.findMany({
    where: {
      excluido: false,
      dataFim: { gte: hoje, lte: limite }
    },
    include: { policial: true }
  });

  res.json({
    success: true,
    data: {
      afastamentos: afastamentos.map(a => ({
        militar: `${a.policial.posto} ${a.policial.nomeGuerra}`,
        vencimento: a.dataFim,
        tipo: a.tipo
      })),
      restricoes: restricoes.map(r => ({
        militar: `${r.policial.posto} ${r.policial.nomeGuerra}`,
        vencimento: r.dataFim,
        codigos: r.codigos
      }))
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SIGO Backend running on port ${PORT}`));