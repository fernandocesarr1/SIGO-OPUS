/**
 * SIGO - Sistema Integrado de Gestão Operacional
 * Backend API - Express + Prisma
 *
 * 4ª Companhia - 3º Batalhão de Polícia Ambiental
 */

import express, { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { addDays, startOfDay, endOfDay, format, parseISO } from 'date-fns';

// ===========================================
// INICIALIZAÇÃO
// ===========================================

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const app = express();

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Manual (sem dependência externa)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Usuario');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logger de requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ===========================================
// CONSTANTES E CONFIGURAÇÕES
// ===========================================

const POSTOS = ['SD', 'CB', 'SGT3', 'SGT2', 'SGT1', 'SUBTEN', 'TEN2', 'TEN1', 'CAP'] as const;

const POSTO_LABELS: Record<string, string> = {
  SD: 'Sd PM',
  CB: 'Cb PM',
  SGT3: '3º Sgt PM',
  SGT2: '2º Sgt PM',
  SGT1: '1º Sgt PM',
  SUBTEN: 'Subten PM',
  TEN2: '2º Ten PM',
  TEN1: '1º Ten PM',
  CAP: 'Cap PM',
};

const TIPOS_AFASTAMENTO = [
  'FERIAS', 'LICENCA_PREMIO', 'LICENCA_SAUDE_FAMILIA', 'LTS', 'CONVALESCENCA',
  'LICENCA_GESTANTE', 'LICENCA_PATERNIDADE', 'LICENCA_ADOCAO', 'LICENCA_CASAMENTO',
  'LICENCA_NOJO', 'LTS_COMPULSORIA', 'MISSAO_ESTUDOS', 'TREINAMENTO_CURSO',
  'TRANSITO_MUDANCA', 'JURI', 'DOACAO_SANGUE', 'LIC_TRATAR_INT_PARTICULAR',
  'LIC_ACOMP_CONJUGE', 'LIC_EXERC_ATIV_PRIVADA', 'PRISAO', 'AGREGACAO', 'OUTROS'
] as const;

const AFASTAMENTOS_SEM_EFETIVO = [
  'LIC_TRATAR_INT_PARTICULAR', 'LIC_ACOMP_CONJUGE', 'LIC_EXERC_ATIV_PRIVADA', 'PRISAO', 'AGREGACAO'
];

const CODIGOS_RESTRICAO_VALIDOS = [
  'AU', 'BS', 'CB', 'CC', 'CI', 'DG', 'DV', 'EF', 'EM', 'EP', 'ES', 'FO', 'IS', 'LP',
  'LR', 'LS', 'MA', 'MC', 'MG', 'MP', 'OU', 'PO', 'PQ', 'PT', 'SA', 'SB', 'SE', 'SF',
  'SG', 'SH', 'SI', 'SM', 'SN', 'SP', 'ST', 'UA', 'UB', 'UC', 'US', 'UU', 'VP'
];

const CODIGOS_CRITICOS = ['UA', 'PO', 'DV', 'SE'];

const STATUS_VIATURA = ['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'BAIXADA'] as const;
const STATUS_OCORRENCIA = ['REGISTRADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ARQUIVADA'] as const;
const TIPOS_MANUTENCAO = ['PREVENTIVA', 'CORRETIVA', 'REVISAO', 'EMERGENCIAL'] as const;

// ===========================================
// UTILITÁRIOS
// ===========================================

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar problemas de timezone
}

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatDateBR(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

function getUsuario(req: Request): string {
  return (req.headers['x-usuario'] as string) || 'SISTEMA';
}

function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.socket.remoteAddress ||
         'unknown';
}

// ===========================================
// AUDITORIA
// ===========================================

async function registrarAuditoria(
  tabela: string,
  registroId: number,
  operacao: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE',
  dadosAnteriores: any,
  dadosNovos: any,
  usuario: string,
  ip?: string
) {
  try {
    await prisma.auditoria.create({
      data: {
        tabela,
        registroId,
        operacao,
        dadosAnteriores: dadosAnteriores ? JSON.parse(JSON.stringify(dadosAnteriores)) : Prisma.JsonNull,
        dadosNovos: dadosNovos ? JSON.parse(JSON.stringify(dadosNovos)) : Prisma.JsonNull,
        usuario,
        ip: ip || null
      }
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// ===========================================
// LÓGICA DE NEGÓCIO
// ===========================================

function aplicarRegrasRestricao(codigos: string[]): { finalCodigos: string[], warnings: string[] } {
  let finalCodigos = [...new Set(codigos.map(c => c.toUpperCase().trim()))];
  const warnings: string[] = [];

  // Validar códigos
  const codigosInvalidos = finalCodigos.filter(c => !CODIGOS_RESTRICAO_VALIDOS.includes(c));
  if (codigosInvalidos.length > 0) {
    throw new Error(`Códigos de restrição inválidos: ${codigosInvalidos.join(', ')}`);
  }

  // Regra BG PM 232/08: SE implica em UU
  if (finalCodigos.includes('SE') && !finalCodigos.includes('UU')) {
    finalCodigos.push('UU');
    warnings.push('Código UU adicionado automaticamente conforme BG PM 232/08 (SE implica em UU)');
  }

  // Identificar códigos críticos
  const criticos = finalCodigos.filter(c => CODIGOS_CRITICOS.includes(c));
  if (criticos.length > 0) {
    warnings.push(`ATENÇÃO: Códigos críticos presentes: ${criticos.join(', ')}. Impactam severamente o emprego operacional.`);
  }

  return { finalCodigos: finalCodigos.sort(), warnings };
}

async function verificarSobreposicaoAfastamento(
  policialId: number,
  dataInicio: Date,
  dataFim: Date | null,
  indeterminado: boolean,
  excludeId?: number
): Promise<any | null> {
  const afastamentos = await prisma.afastamento.findMany({
    where: {
      policialId,
      excluido: false,
      ...(excludeId ? { id: { not: excludeId } } : {})
    }
  });

  for (const a of afastamentos) {
    const aStart = a.dataInicio;
    const aEnd = a.dataFim;
    const aIndet = a.indeterminado;

    let overlap = false;

    if (!indeterminado && dataFim && !aIndet && aEnd) {
      // Ambos têm data fim definida
      overlap = !(dataInicio > aEnd || aStart > dataFim);
    } else if (indeterminado || !dataFim) {
      // Novo afastamento é indeterminado
      overlap = !aEnd || aEnd >= dataInicio;
    } else if (aIndet || !aEnd) {
      // Existente é indeterminado
      overlap = !dataFim || dataFim >= aStart;
    }

    if (overlap) {
      return a;
    }
  }

  return null;
}

function calcularStatusOperacional(policial: any): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Verificar afastamentos ativos
  const afastamentoAtivo = policial.afastamentos?.find((a: any) => {
    if (a.excluido) return false;
    const inicio = new Date(a.dataInicio);
    const fim = a.dataFim ? new Date(a.dataFim) : null;
    return inicio <= hoje && (!fim || fim >= hoje || a.indeterminado);
  });

  if (afastamentoAtivo) return 'AFASTADO';

  // Verificar restrições ativas
  const restricaoAtiva = policial.restricoes?.find((r: any) => {
    if (r.excluido) return false;
    const inicio = new Date(r.dataInicio);
    const fim = new Date(r.dataFim);
    return inicio <= hoje && fim >= hoje;
  });

  if (restricaoAtiva) return 'APTO_COM_RESTRICAO';

  return 'APTO';
}

// ===========================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ===========================================

const PolicialCreateSchema = z.object({
  re: z.string().min(1).max(20),
  digito: z.string().max(2).optional(),
  nome: z.string().min(3).max(200),
  nomeGuerra: z.string().min(2).max(100),
  posto: z.enum(POSTOS),
  funcao: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().max(20).optional(),
  subunidadeId: z.number().optional(),
  dataInclusao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const PolicialUpdateSchema = PolicialCreateSchema.partial();

const AfastamentoCreateSchema = z.object({
  policialId: z.number().int().positive(),
  tipo: z.enum(TIPOS_AFASTAMENTO),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  indeterminado: z.boolean().default(false),
  documento: z.string().max(100).optional(),
  observacao: z.string().optional(),
});

const AfastamentoUpdateSchema = AfastamentoCreateSchema.partial().omit({ policialId: true });

const RestricaoCreateSchema = z.object({
  policialId: z.number().int().positive(),
  codigos: z.array(z.string().max(5)).min(1).max(20),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documento: z.string().min(1).max(100),
  parecerMedico: z.string().optional(),
  observacao: z.string().optional(),
});

const RestricaoUpdateSchema = RestricaoCreateSchema.partial().omit({ policialId: true });

const OcorrenciaCreateSchema = z.object({
  numero: z.string().min(1).max(30),
  tipoId: z.number().int().positive(),
  dataHora: z.string(),
  local: z.string().min(1).max(200),
  municipio: z.string().min(1).max(100),
  coordenadas: z.string().max(50).optional(),
  descricao: z.string().min(1),
  status: z.enum(STATUS_OCORRENCIA).default('REGISTRADA'),
  policialResponsavelId: z.number().int().positive().optional(),
  viaturaId: z.number().int().positive().optional(),
  autoInfracao: z.string().max(50).optional(),
  valorMulta: z.number().optional(),
  areaPatrulhadaKm: z.number().optional(),
  observacao: z.string().optional(),
});

const OcorrenciaUpdateSchema = OcorrenciaCreateSchema.partial();

const ViaturaCreateSchema = z.object({
  prefixo: z.string().min(1).max(20),
  placa: z.string().min(7).max(10),
  modelo: z.string().min(1).max(50),
  marca: z.string().max(50).optional(),
  ano: z.number().int().min(1990).max(2030).optional(),
  cor: z.string().max(30).optional(),
  chassi: z.string().max(50).optional(),
  renavam: z.string().max(20).optional(),
  kmAtual: z.number().int().min(0).default(0),
  kmProxRevisao: z.number().int().min(0).optional(),
  status: z.enum(STATUS_VIATURA).default('DISPONIVEL'),
  observacao: z.string().optional(),
});

const ViaturaUpdateSchema = ViaturaCreateSchema.partial();

const ManutencaoCreateSchema = z.object({
  viaturaId: z.number().int().positive(),
  tipo: z.enum(TIPOS_MANUTENCAO),
  descricao: z.string().min(1),
  dataEntrada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataSaida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  kmEntrada: z.number().int().min(0),
  kmSaida: z.number().int().min(0).optional(),
  custo: z.number().min(0).optional(),
  oficina: z.string().max(100).optional(),
  notaFiscal: z.string().max(50).optional(),
  concluida: z.boolean().default(false),
  observacao: z.string().optional(),
});

const ManutencaoUpdateSchema = ManutencaoCreateSchema.partial().omit({ viaturaId: true });

const OperacaoCreateSchema = z.object({
  nome: z.string().min(1).max(150),
  descricao: z.string().optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  localidade: z.string().min(1).max(200),
  objetivo: z.string().min(1),
  efetivoPrevisto: z.number().int().min(0).default(0),
  efetivoReal: z.number().int().min(0).default(0),
  viaturasUtilizadas: z.number().int().min(0).default(0),
  resultados: z.string().optional(),
});

const OperacaoUpdateSchema = OperacaoCreateSchema.partial();

// ===========================================
// MIDDLEWARE DE ERRO
// ===========================================

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Erro:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.errors.map(e => ({ campo: e.path.join('.'), mensagem: e.message }))
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Registro duplicado. Já existe um registro com estes dados únicos.'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado.'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

// ===========================================
// ROTAS - POLICIAIS (P/1)
// ===========================================

// Listar todos os policiais
app.get('/api/policiais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '50',
      busca,
      posto,
      subunidadeId,
      status,
      ativo = 'true'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.PolicialWhereInput = {
      ativo: ativo === 'true',
      ...(busca && {
        OR: [
          { nome: { contains: busca as string, mode: 'insensitive' } },
          { nomeGuerra: { contains: busca as string, mode: 'insensitive' } },
          { re: { contains: busca as string } }
        ]
      }),
      ...(posto && { posto: posto as any }),
      ...(subunidadeId && { subunidadeId: parseInt(subunidadeId as string) })
    };

    const [policiais, total] = await Promise.all([
      prisma.policial.findMany({
        where,
        include: {
          subunidade: true,
          afastamentos: {
            where: { excluido: false },
            orderBy: { dataInicio: 'desc' },
            take: 1
          },
          restricoes: {
            where: { excluido: false },
            orderBy: { dataFim: 'desc' },
            take: 5
          }
        },
        orderBy: [
          { posto: 'desc' },
          { nomeGuerra: 'asc' }
        ],
        skip,
        take
      }),
      prisma.policial.count({ where })
    ]);

    // Calcular status operacional de cada policial
    const policiaisComStatus = policiais.map(p => ({
      ...p,
      statusOperacional: calcularStatusOperacional(p),
      postoLabel: POSTO_LABELS[p.posto] || p.posto
    }));

    // Filtrar por status se solicitado
    let resultado = policiaisComStatus;
    if (status) {
      resultado = policiaisComStatus.filter(p => p.statusOperacional === status);
    }

    res.json({
      success: true,
      data: resultado,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar policial por ID
app.get('/api/policiais/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const policial = await prisma.policial.findUnique({
      where: { id: parseInt(id) },
      include: {
        subunidade: true,
        afastamentos: {
          where: { excluido: false },
          orderBy: { dataInicio: 'desc' }
        },
        restricoes: {
          where: { excluido: false },
          orderBy: { dataFim: 'desc' }
        }
      }
    });

    if (!policial) {
      return res.status(404).json({ success: false, error: 'Policial não encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...policial,
        statusOperacional: calcularStatusOperacional(policial),
        postoLabel: POSTO_LABELS[policial.posto] || policial.posto
      }
    });
  } catch (error) {
    next(error);
  }
});

// Criar policial
app.post('/api/policiais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = PolicialCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    // Verificar se RE já existe
    const existente = await prisma.policial.findUnique({ where: { re: data.re } });
    if (existente) {
      return res.status(409).json({ success: false, error: 'RE já cadastrado no sistema' });
    }

    const policial = await prisma.policial.create({
      data: {
        ...data,
        email: data.email || null,
        dataInclusao: data.dataInclusao ? parseLocalDate(data.dataInclusao) : null,
        dataNascimento: data.dataNascimento ? parseLocalDate(data.dataNascimento) : null,
        criadoPorUsuario: usuario
      },
      include: { subunidade: true }
    });

    await registrarAuditoria('policiais', policial.id, 'CREATE', null, policial, usuario, ip);

    res.status(201).json({ success: true, data: policial });
  } catch (error) {
    next(error);
  }
});

// Atualizar policial
app.put('/api/policiais/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = PolicialUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.policial.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Policial não encontrado' });
    }

    const policial = await prisma.policial.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        email: data.email || null,
        dataInclusao: data.dataInclusao ? parseLocalDate(data.dataInclusao) : undefined,
        dataNascimento: data.dataNascimento ? parseLocalDate(data.dataNascimento) : undefined
      },
      include: { subunidade: true }
    });

    await registrarAuditoria('policiais', policial.id, 'UPDATE', anterior, policial, usuario, ip);

    res.json({ success: true, data: policial });
  } catch (error) {
    next(error);
  }
});

// Soft delete policial
app.delete('/api/policiais/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.policial.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Policial não encontrado' });
    }

    const policial = await prisma.policial.update({
      where: { id: parseInt(id) },
      data: { ativo: false }
    });

    await registrarAuditoria('policiais', policial.id, 'DELETE', anterior, policial, usuario, ip);

    res.json({ success: true, message: 'Policial desativado com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - AFASTAMENTOS (P/1)
// ===========================================

// Listar afastamentos
app.get('/api/afastamentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { policialId, tipo, ativo, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);
    const hoje = startOfDay(new Date());

    const where: Prisma.AfastamentoWhereInput = {
      excluido: false,
      ...(policialId && { policialId: parseInt(policialId as string) }),
      ...(tipo && { tipo: tipo as any }),
      ...(ativo === 'true' && {
        dataInicio: { lte: hoje },
        OR: [
          { dataFim: { gte: hoje } },
          { dataFim: null },
          { indeterminado: true }
        ]
      })
    };

    const [afastamentos, total] = await Promise.all([
      prisma.afastamento.findMany({
        where,
        include: {
          policial: {
            select: { id: true, re: true, nome: true, nomeGuerra: true, posto: true }
          }
        },
        orderBy: { dataInicio: 'desc' },
        skip,
        take
      }),
      prisma.afastamento.count({ where })
    ]);

    res.json({
      success: true,
      data: afastamentos.map(a => ({
        ...a,
        militar: `${POSTO_LABELS[a.policial.posto] || a.policial.posto} ${a.policial.nomeGuerra}`
      })),
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar afastamento por ID
app.get('/api/afastamentos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const afastamento = await prisma.afastamento.findFirst({
      where: { id: parseInt(id), excluido: false },
      include: { policial: true }
    });

    if (!afastamento) {
      return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });
    }

    res.json({ success: true, data: afastamento });
  } catch (error) {
    next(error);
  }
});

// Criar afastamento
app.post('/api/afastamentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AfastamentoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    // Verificar se policial existe
    const policial = await prisma.policial.findUnique({ where: { id: data.policialId } });
    if (!policial) {
      return res.status(404).json({ success: false, error: 'Policial não encontrado' });
    }

    const dataInicio = parseLocalDate(data.dataInicio);
    const dataFim = data.dataFim ? parseLocalDate(data.dataFim) : null;

    // Verificar sobreposição
    const conflito = await verificarSobreposicaoAfastamento(
      data.policialId, dataInicio, dataFim, data.indeterminado || false
    );

    if (conflito) {
      return res.status(409).json({
        success: false,
        error: `CONFLITO: Já existe afastamento no período. Tipo: ${conflito.tipo}, Início: ${formatDateBR(conflito.dataInicio)}`
      });
    }

    const contaEfetivo = !AFASTAMENTOS_SEM_EFETIVO.includes(data.tipo);
    const warnings: string[] = [];

    if (!contaEfetivo) {
      warnings.push('Este tipo de afastamento NÃO conta como efetivo exercício para aposentadoria/promoção.');
    }

    const afastamento = await prisma.afastamento.create({
      data: {
        ...data,
        dataInicio,
        dataFim,
        contaEfetivoExercicio: contaEfetivo,
        criadoPorUsuario: usuario
      },
      include: { policial: true }
    });

    await registrarAuditoria('afastamentos', afastamento.id, 'CREATE', null, afastamento, usuario, ip);

    res.status(201).json({ success: true, data: afastamento, warnings });
  } catch (error) {
    next(error);
  }
});

// Atualizar afastamento
app.put('/api/afastamentos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = AfastamentoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.afastamento.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });
    }

    // Verificar sobreposição se datas mudaram
    if (data.dataInicio || data.dataFim) {
      const dataInicio = data.dataInicio ? parseLocalDate(data.dataInicio) : anterior.dataInicio;
      const dataFim = data.dataFim ? parseLocalDate(data.dataFim) : anterior.dataFim;
      const indeterminado = data.indeterminado !== undefined ? data.indeterminado : anterior.indeterminado;

      const conflito = await verificarSobreposicaoAfastamento(
        anterior.policialId, dataInicio, dataFim, indeterminado, parseInt(id)
      );

      if (conflito) {
        return res.status(409).json({
          success: false,
          error: `CONFLITO: Já existe afastamento no período. Tipo: ${conflito.tipo}`
        });
      }
    }

    const contaEfetivo = data.tipo
      ? !AFASTAMENTOS_SEM_EFETIVO.includes(data.tipo)
      : anterior.contaEfetivoExercicio;

    const afastamento = await prisma.afastamento.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        dataInicio: data.dataInicio ? parseLocalDate(data.dataInicio) : undefined,
        dataFim: data.dataFim ? parseLocalDate(data.dataFim) : undefined,
        contaEfetivoExercicio: contaEfetivo
      },
      include: { policial: true }
    });

    await registrarAuditoria('afastamentos', afastamento.id, 'UPDATE', anterior, afastamento, usuario, ip);

    res.json({ success: true, data: afastamento });
  } catch (error) {
    next(error);
  }
});

// Soft delete afastamento
app.delete('/api/afastamentos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.afastamento.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });
    }

    const afastamento = await prisma.afastamento.update({
      where: { id: parseInt(id) },
      data: { excluido: true }
    });

    await registrarAuditoria('afastamentos', afastamento.id, 'DELETE', anterior, afastamento, usuario, ip);

    res.json({ success: true, message: 'Afastamento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - RESTRIÇÕES (P/1)
// ===========================================

// Listar restrições
app.get('/api/restricoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { policialId, ativo, critico, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);
    const hoje = startOfDay(new Date());

    const where: Prisma.RestricaoWhereInput = {
      excluido: false,
      ...(policialId && { policialId: parseInt(policialId as string) }),
      ...(critico === 'true' && { temCodigoCritico: true }),
      ...(ativo === 'true' && {
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje }
      })
    };

    const [restricoes, total] = await Promise.all([
      prisma.restricao.findMany({
        where,
        include: {
          policial: {
            select: { id: true, re: true, nome: true, nomeGuerra: true, posto: true }
          }
        },
        orderBy: { dataFim: 'asc' },
        skip,
        take
      }),
      prisma.restricao.count({ where })
    ]);

    res.json({
      success: true,
      data: restricoes.map(r => ({
        ...r,
        militar: `${POSTO_LABELS[r.policial.posto] || r.policial.posto} ${r.policial.nomeGuerra}`
      })),
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar restrição por ID
app.get('/api/restricoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const restricao = await prisma.restricao.findFirst({
      where: { id: parseInt(id), excluido: false },
      include: { policial: true }
    });

    if (!restricao) {
      return res.status(404).json({ success: false, error: 'Restrição não encontrada' });
    }

    res.json({ success: true, data: restricao });
  } catch (error) {
    next(error);
  }
});

// Criar restrição
app.post('/api/restricoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RestricaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    // Verificar se policial existe
    const policial = await prisma.policial.findUnique({ where: { id: data.policialId } });
    if (!policial) {
      return res.status(404).json({ success: false, error: 'Policial não encontrado' });
    }

    // Aplicar regras de restrição
    const { finalCodigos, warnings } = aplicarRegrasRestricao(data.codigos);
    const temCritico = finalCodigos.some(c => CODIGOS_CRITICOS.includes(c));

    // Validação de sigilo médico
    if (data.parecerMedico) {
      const termosSigilosos = ['HIV', 'AIDS', 'CÂNCER', 'CANCER', 'PSIQUIAT', 'MENTAL', 'DEPRESSÃO', 'DEPRESSAO'];
      const contemSigilo = termosSigilosos.some(t =>
        data.parecerMedico!.toUpperCase().includes(t)
      );
      if (contemSigilo) {
        warnings.push('ATENÇÃO: O parecer médico pode conter informações sigilosas. Verifique a conformidade com a legislação de sigilo médico.');
      }
    }

    const restricao = await prisma.restricao.create({
      data: {
        ...data,
        codigos: finalCodigos,
        dataInicio: parseLocalDate(data.dataInicio),
        dataFim: parseLocalDate(data.dataFim),
        temCodigoCritico: temCritico,
        criadoPorUsuario: usuario
      },
      include: { policial: true }
    });

    await registrarAuditoria('restricoes', restricao.id, 'CREATE', null, restricao, usuario, ip);

    res.status(201).json({ success: true, data: restricao, warnings });
  } catch (error) {
    next(error);
  }
});

// Atualizar restrição
app.put('/api/restricoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = RestricaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.restricao.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Restrição não encontrada' });
    }

    let finalCodigos = anterior.codigos;
    let temCritico = anterior.temCodigoCritico;
    const warnings: string[] = [];

    if (data.codigos) {
      const resultado = aplicarRegrasRestricao(data.codigos);
      finalCodigos = resultado.finalCodigos;
      warnings.push(...resultado.warnings);
      temCritico = finalCodigos.some(c => CODIGOS_CRITICOS.includes(c));
    }

    const restricao = await prisma.restricao.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        codigos: finalCodigos,
        dataInicio: data.dataInicio ? parseLocalDate(data.dataInicio) : undefined,
        dataFim: data.dataFim ? parseLocalDate(data.dataFim) : undefined,
        temCodigoCritico: temCritico
      },
      include: { policial: true }
    });

    await registrarAuditoria('restricoes', restricao.id, 'UPDATE', anterior, restricao, usuario, ip);

    res.json({ success: true, data: restricao, warnings });
  } catch (error) {
    next(error);
  }
});

// Soft delete restrição
app.delete('/api/restricoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.restricao.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Restrição não encontrada' });
    }

    const restricao = await prisma.restricao.update({
      where: { id: parseInt(id) },
      data: { excluido: true }
    });

    await registrarAuditoria('restricoes', restricao.id, 'DELETE', anterior, restricao, usuario, ip);

    res.json({ success: true, message: 'Restrição excluída com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - OCORRÊNCIAS (P/3)
// ===========================================

// Listar tipos de ocorrência
app.get('/api/tipos-ocorrencia', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tipos = await prisma.tipoOcorrencia.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json({ success: true, data: tipos });
  } catch (error) {
    next(error);
  }
});

// Criar tipo de ocorrência
app.post('/api/tipos-ocorrencia', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, descricao } = req.body;

    const tipo = await prisma.tipoOcorrencia.create({
      data: { nome, descricao }
    });

    res.status(201).json({ success: true, data: tipo });
  } catch (error) {
    next(error);
  }
});

// Listar ocorrências
app.get('/api/ocorrencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      busca, tipoId, status, municipio, dataInicio, dataFim,
      page = '1', limit = '50'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.OcorrenciaWhereInput = {
      excluido: false,
      ...(tipoId && { tipoId: parseInt(tipoId as string) }),
      ...(status && { status: status as any }),
      ...(municipio && { municipio: { contains: municipio as string, mode: 'insensitive' } }),
      ...(dataInicio && dataFim && {
        dataHora: {
          gte: parseLocalDate(dataInicio as string),
          lte: endOfDay(parseLocalDate(dataFim as string))
        }
      }),
      ...(busca && {
        OR: [
          { numero: { contains: busca as string, mode: 'insensitive' } },
          { local: { contains: busca as string, mode: 'insensitive' } },
          { municipio: { contains: busca as string, mode: 'insensitive' } },
          { descricao: { contains: busca as string, mode: 'insensitive' } }
        ]
      })
    };

    const [ocorrencias, total] = await Promise.all([
      prisma.ocorrencia.findMany({
        where,
        include: {
          tipo: true,
          policialResponsavel: {
            select: { id: true, nomeGuerra: true, posto: true }
          },
          viatura: {
            select: { id: true, prefixo: true, modelo: true }
          }
        },
        orderBy: { dataHora: 'desc' },
        skip,
        take
      }),
      prisma.ocorrencia.count({ where })
    ]);

    res.json({
      success: true,
      data: ocorrencias,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar ocorrência por ID
app.get('/api/ocorrencias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const ocorrencia = await prisma.ocorrencia.findFirst({
      where: { id: parseInt(id), excluido: false },
      include: {
        tipo: true,
        policialResponsavel: true,
        viatura: true
      }
    });

    if (!ocorrencia) {
      return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
    }

    res.json({ success: true, data: ocorrencia });
  } catch (error) {
    next(error);
  }
});

// Criar ocorrência
app.post('/api/ocorrencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = OcorrenciaCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        ...data,
        dataHora: new Date(data.dataHora),
        valorMulta: data.valorMulta ? new Prisma.Decimal(data.valorMulta) : null,
        areaPatrulhadaKm: data.areaPatrulhadaKm ? new Prisma.Decimal(data.areaPatrulhadaKm) : null,
        criadoPorUsuario: usuario
      },
      include: { tipo: true, policialResponsavel: true, viatura: true }
    });

    await registrarAuditoria('ocorrencias', ocorrencia.id, 'CREATE', null, ocorrencia, usuario, ip);

    res.status(201).json({ success: true, data: ocorrencia });
  } catch (error) {
    next(error);
  }
});

// Atualizar ocorrência
app.put('/api/ocorrencias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = OcorrenciaUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.ocorrencia.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
    }

    const ocorrencia = await prisma.ocorrencia.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        dataHora: data.dataHora ? new Date(data.dataHora) : undefined,
        valorMulta: data.valorMulta !== undefined ? new Prisma.Decimal(data.valorMulta) : undefined,
        areaPatrulhadaKm: data.areaPatrulhadaKm !== undefined ? new Prisma.Decimal(data.areaPatrulhadaKm) : undefined
      },
      include: { tipo: true, policialResponsavel: true, viatura: true }
    });

    await registrarAuditoria('ocorrencias', ocorrencia.id, 'UPDATE', anterior, ocorrencia, usuario, ip);

    res.json({ success: true, data: ocorrencia });
  } catch (error) {
    next(error);
  }
});

// Soft delete ocorrência
app.delete('/api/ocorrencias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.ocorrencia.findFirst({
      where: { id: parseInt(id), excluido: false }
    });

    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
    }

    const ocorrencia = await prisma.ocorrencia.update({
      where: { id: parseInt(id) },
      data: { excluido: true }
    });

    await registrarAuditoria('ocorrencias', ocorrencia.id, 'DELETE', anterior, ocorrencia, usuario, ip);

    res.json({ success: true, message: 'Ocorrência excluída com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - OPERAÇÕES (P/3)
// ===========================================

// Listar operações
app.get('/api/operacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ativa, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.OperacaoWhereInput = {
      ...(ativa !== undefined && { ativa: ativa === 'true' })
    };

    const [operacoes, total] = await Promise.all([
      prisma.operacao.findMany({
        where,
        orderBy: { dataInicio: 'desc' },
        skip,
        take
      }),
      prisma.operacao.count({ where })
    ]);

    res.json({
      success: true,
      data: operacoes,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Criar operação
app.post('/api/operacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = OperacaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const operacao = await prisma.operacao.create({
      data: {
        ...data,
        dataInicio: parseLocalDate(data.dataInicio),
        dataFim: data.dataFim ? parseLocalDate(data.dataFim) : null,
        criadoPorUsuario: usuario
      }
    });

    await registrarAuditoria('operacoes', operacao.id, 'CREATE', null, operacao, usuario, ip);

    res.status(201).json({ success: true, data: operacao });
  } catch (error) {
    next(error);
  }
});

// Atualizar operação
app.put('/api/operacoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = OperacaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.operacao.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Operação não encontrada' });
    }

    const operacao = await prisma.operacao.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        dataInicio: data.dataInicio ? parseLocalDate(data.dataInicio) : undefined,
        dataFim: data.dataFim ? parseLocalDate(data.dataFim) : undefined
      }
    });

    await registrarAuditoria('operacoes', operacao.id, 'UPDATE', anterior, operacao, usuario, ip);

    res.json({ success: true, data: operacao });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - VIATURAS (P/4)
// ===========================================

// Listar viaturas
app.get('/api/viaturas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { busca, status, ativo = 'true', page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.ViaturaWhereInput = {
      ativo: ativo === 'true',
      ...(status && { status: status as any }),
      ...(busca && {
        OR: [
          { prefixo: { contains: busca as string, mode: 'insensitive' } },
          { placa: { contains: busca as string, mode: 'insensitive' } },
          { modelo: { contains: busca as string, mode: 'insensitive' } },
          { marca: { contains: busca as string, mode: 'insensitive' } }
        ]
      })
    };

    const [viaturas, total] = await Promise.all([
      prisma.viatura.findMany({
        where,
        include: {
          manutencoes: {
            where: { concluida: false },
            take: 1
          }
        },
        orderBy: { prefixo: 'asc' },
        skip,
        take
      }),
      prisma.viatura.count({ where })
    ]);

    res.json({
      success: true,
      data: viaturas.map(v => ({
        ...v,
        emManutencao: v.manutencoes.length > 0
      })),
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar viatura por ID
app.get('/api/viaturas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const viatura = await prisma.viatura.findFirst({
      where: { id: parseInt(id), ativo: true },
      include: {
        manutencoes: {
          orderBy: { dataEntrada: 'desc' },
          take: 10
        }
      }
    });

    if (!viatura) {
      return res.status(404).json({ success: false, error: 'Viatura não encontrada' });
    }

    res.json({ success: true, data: viatura });
  } catch (error) {
    next(error);
  }
});

// Criar viatura
app.post('/api/viaturas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ViaturaCreateSchema.parse(req.body);

    const viatura = await prisma.viatura.create({ data });

    res.status(201).json({ success: true, data: viatura });
  } catch (error) {
    next(error);
  }
});

// Atualizar viatura
app.put('/api/viaturas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = ViaturaUpdateSchema.parse(req.body);

    const viatura = await prisma.viatura.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ success: true, data: viatura });
  } catch (error) {
    next(error);
  }
});

// Soft delete viatura
app.delete('/api/viaturas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const viatura = await prisma.viatura.update({
      where: { id: parseInt(id) },
      data: { ativo: false }
    });

    res.json({ success: true, message: 'Viatura desativada com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - MANUTENÇÕES (P/4)
// ===========================================

// Listar manutenções
app.get('/api/manutencoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { viaturaId, concluida, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.ManutencaoWhereInput = {
      ...(viaturaId && { viaturaId: parseInt(viaturaId as string) }),
      ...(concluida !== undefined && { concluida: concluida === 'true' })
    };

    const [manutencoes, total] = await Promise.all([
      prisma.manutencao.findMany({
        where,
        include: {
          viatura: {
            select: { id: true, prefixo: true, modelo: true, placa: true }
          }
        },
        orderBy: { dataEntrada: 'desc' },
        skip,
        take
      }),
      prisma.manutencao.count({ where })
    ]);

    res.json({
      success: true,
      data: manutencoes,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Criar manutenção
app.post('/api/manutencoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ManutencaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    // Verificar se viatura existe
    const viatura = await prisma.viatura.findUnique({ where: { id: data.viaturaId } });
    if (!viatura) {
      return res.status(404).json({ success: false, error: 'Viatura não encontrada' });
    }

    // Atualizar status da viatura para MANUTENCAO
    await prisma.viatura.update({
      where: { id: data.viaturaId },
      data: { status: 'MANUTENCAO' }
    });

    const manutencao = await prisma.manutencao.create({
      data: {
        ...data,
        dataEntrada: parseLocalDate(data.dataEntrada),
        dataSaida: data.dataSaida ? parseLocalDate(data.dataSaida) : null,
        custo: data.custo ? new Prisma.Decimal(data.custo) : null,
        criadoPorUsuario: usuario
      },
      include: { viatura: true }
    });

    await registrarAuditoria('manutencoes', manutencao.id, 'CREATE', null, manutencao, usuario, ip);

    res.status(201).json({ success: true, data: manutencao });
  } catch (error) {
    next(error);
  }
});

// Atualizar manutenção
app.put('/api/manutencoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = ManutencaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.manutencao.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) {
      return res.status(404).json({ success: false, error: 'Manutenção não encontrada' });
    }

    const manutencao = await prisma.manutencao.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        dataEntrada: data.dataEntrada ? parseLocalDate(data.dataEntrada) : undefined,
        dataSaida: data.dataSaida ? parseLocalDate(data.dataSaida) : undefined,
        custo: data.custo !== undefined ? new Prisma.Decimal(data.custo) : undefined
      },
      include: { viatura: true }
    });

    // Se manutenção foi concluída, atualizar status da viatura
    if (data.concluida === true) {
      await prisma.viatura.update({
        where: { id: anterior.viaturaId },
        data: {
          status: 'DISPONIVEL',
          kmAtual: data.kmSaida || anterior.kmSaida || anterior.kmEntrada
        }
      });
    }

    await registrarAuditoria('manutencoes', manutencao.id, 'UPDATE', anterior, manutencao, usuario, ip);

    res.json({ success: true, data: manutencao });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - MATERIAIS (P/4)
// ===========================================

// Listar materiais
app.get('/api/materiais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoria, estoqueMinimo, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.MaterialWhereInput = {
      ativo: true,
      ...(categoria && { categoria: categoria as string }),
      ...(estoqueMinimo === 'true' && {
        quantidadeAtual: { lte: prisma.material.fields.quantidadeMinima }
      })
    };

    const [materiais, total] = await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip,
        take
      }),
      prisma.material.count({ where })
    ]);

    // Filtrar materiais abaixo do estoque mínimo após a query
    let resultado = materiais;
    if (estoqueMinimo === 'true') {
      resultado = materiais.filter(m => m.quantidadeAtual <= m.quantidadeMinima);
    }

    res.json({
      success: true,
      data: resultado.map(m => ({
        ...m,
        estoqueStatus: m.quantidadeAtual <= m.quantidadeMinima ? 'BAIXO' : 'OK'
      })),
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - SUBUNIDADES
// ===========================================

// Listar subunidades
app.get('/api/subunidades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subunidades = await prisma.subunidade.findMany({
      where: { ativo: true },
      include: {
        _count: { select: { policiais: true } }
      },
      orderBy: { nome: 'asc' }
    });

    res.json({ success: true, data: subunidades });
  } catch (error) {
    next(error);
  }
});

// Criar subunidade
app.post('/api/subunidades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, sigla } = req.body;

    const subunidade = await prisma.subunidade.create({
      data: { nome, sigla }
    });

    res.status(201).json({ success: true, data: subunidade });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - DASHBOARD
// ===========================================

// Dashboard: Resumo do efetivo
app.get('/api/dashboard/efetivo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hoje = startOfDay(new Date());

    // Total de policiais ativos
    const totalPoliciais = await prisma.policial.count({ where: { ativo: true } });

    // Buscar todos os policiais com suas relações
    const policiais = await prisma.policial.findMany({
      where: { ativo: true },
      include: {
        afastamentos: { where: { excluido: false } },
        restricoes: { where: { excluido: false } }
      }
    });

    // Calcular estatísticas
    let aptos = 0;
    let comRestricao = 0;
    let afastados = 0;

    policiais.forEach(p => {
      const status = calcularStatusOperacional(p);
      if (status === 'APTO') aptos++;
      else if (status === 'APTO_COM_RESTRICAO') comRestricao++;
      else if (status === 'AFASTADO') afastados++;
    });

    // Contagem por posto
    const porPosto = await prisma.policial.groupBy({
      by: ['posto'],
      where: { ativo: true },
      _count: true
    });

    res.json({
      success: true,
      data: {
        total: totalPoliciais,
        aptos,
        comRestricao,
        afastados,
        porPosto: porPosto.map(p => ({
          posto: p.posto,
          postoLabel: POSTO_LABELS[p.posto] || p.posto,
          quantidade: p._count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard: Vencimentos próximos
app.get('/api/dashboard/vencimentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dias = parseInt(req.query.dias as string) || 7;
    const hoje = startOfDay(new Date());
    const limite = addDays(hoje, dias);

    const [afastamentos, restricoes] = await Promise.all([
      prisma.afastamento.findMany({
        where: {
          excluido: false,
          indeterminado: false,
          dataFim: { gte: hoje, lte: limite }
        },
        include: {
          policial: { select: { posto: true, nomeGuerra: true } }
        },
        orderBy: { dataFim: 'asc' }
      }),
      prisma.restricao.findMany({
        where: {
          excluido: false,
          dataFim: { gte: hoje, lte: limite }
        },
        include: {
          policial: { select: { posto: true, nomeGuerra: true } }
        },
        orderBy: { dataFim: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        afastamentos: afastamentos.map(a => ({
          id: a.id,
          militar: `${POSTO_LABELS[a.policial.posto] || a.policial.posto} ${a.policial.nomeGuerra}`,
          tipo: a.tipo,
          vencimento: a.dataFim,
          diasRestantes: Math.ceil((a.dataFim!.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        })),
        restricoes: restricoes.map(r => ({
          id: r.id,
          militar: `${POSTO_LABELS[r.policial.posto] || r.policial.posto} ${r.policial.nomeGuerra}`,
          codigos: r.codigos,
          vencimento: r.dataFim,
          diasRestantes: Math.ceil((r.dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)),
          critico: r.temCodigoCritico
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard: Alertas críticos
app.get('/api/dashboard/alertas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hoje = startOfDay(new Date());
    const em7dias = addDays(hoje, 7);

    // Restrições críticas ativas
    const restricoesCriticas = await prisma.restricao.findMany({
      where: {
        excluido: false,
        temCodigoCritico: true,
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje }
      },
      include: {
        policial: { select: { posto: true, nomeGuerra: true, re: true } }
      }
    });

    // Viaturas em manutenção
    const viaturasManutencao = await prisma.viatura.findMany({
      where: { status: 'MANUTENCAO', ativo: true }
    });

    // Afastamentos vencendo em 7 dias
    const afastamentosVencendo = await prisma.afastamento.count({
      where: {
        excluido: false,
        indeterminado: false,
        dataFim: { gte: hoje, lte: em7dias }
      }
    });

    // Materiais com estoque baixo
    const materiaisBaixoEstoque = await prisma.material.findMany({
      where: { ativo: true }
    });
    const materiaisAlerta = materiaisBaixoEstoque.filter(m => m.quantidadeAtual <= m.quantidadeMinima);

    res.json({
      success: true,
      data: {
        restricoesCriticas: restricoesCriticas.map(r => ({
          id: r.id,
          militar: `${POSTO_LABELS[r.policial.posto]} ${r.policial.nomeGuerra}`,
          re: r.policial.re,
          codigos: r.codigos,
          vencimento: r.dataFim
        })),
        viaturasManutencao: viaturasManutencao.map(v => ({
          id: v.id,
          prefixo: v.prefixo,
          modelo: v.modelo
        })),
        afastamentosVencendo,
        materiaisAlerta: materiaisAlerta.length,
        totalAlertas: restricoesCriticas.length + viaturasManutencao.length +
                      (afastamentosVencendo > 0 ? 1 : 0) + (materiaisAlerta.length > 0 ? 1 : 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard: Estatísticas de ocorrências
app.get('/api/dashboard/ocorrencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { periodo = '30' } = req.query;
    const dias = parseInt(periodo as string);
    const dataInicio = addDays(startOfDay(new Date()), -dias);

    // Total de ocorrências no período
    const totalOcorrencias = await prisma.ocorrencia.count({
      where: {
        excluido: false,
        dataHora: { gte: dataInicio }
      }
    });

    // Por status
    const porStatus = await prisma.ocorrencia.groupBy({
      by: ['status'],
      where: {
        excluido: false,
        dataHora: { gte: dataInicio }
      },
      _count: true
    });

    // Por tipo
    const porTipo = await prisma.ocorrencia.groupBy({
      by: ['tipoId'],
      where: {
        excluido: false,
        dataHora: { gte: dataInicio }
      },
      _count: true,
      orderBy: { _count: { tipoId: 'desc' } },
      take: 5
    });

    // Buscar nomes dos tipos
    const tipoIds = porTipo.map(t => t.tipoId);
    const tipos = await prisma.tipoOcorrencia.findMany({
      where: { id: { in: tipoIds } }
    });

    // Total de autos de infração
    const autosInfracao = await prisma.ocorrencia.count({
      where: {
        excluido: false,
        dataHora: { gte: dataInicio },
        autoInfracao: { not: null }
      }
    });

    // Área total patrulhada
    const areaTotal = await prisma.ocorrencia.aggregate({
      where: {
        excluido: false,
        dataHora: { gte: dataInicio },
        areaPatrulhadaKm: { not: null }
      },
      _sum: { areaPatrulhadaKm: true }
    });

    res.json({
      success: true,
      data: {
        total: totalOcorrencias,
        autosInfracao,
        areaPatrulhadaKm: areaTotal._sum.areaPatrulhadaKm || 0,
        porStatus: porStatus.map(s => ({ status: s.status, quantidade: s._count })),
        porTipo: porTipo.map(t => {
          const tipo = tipos.find(tp => tp.id === t.tipoId);
          return { tipo: tipo?.nome || 'Desconhecido', quantidade: t._count };
        })
      }
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard: Estatísticas de viaturas
app.get('/api/dashboard/viaturas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const porStatus = await prisma.viatura.groupBy({
      by: ['status'],
      where: { ativo: true },
      _count: true
    });

    const total = await prisma.viatura.count({ where: { ativo: true } });

    const disponiveis = porStatus.find(s => s.status === 'DISPONIVEL')?._count || 0;
    const emUso = porStatus.find(s => s.status === 'EM_USO')?._count || 0;
    const manutencao = porStatus.find(s => s.status === 'MANUTENCAO')?._count || 0;
    const baixadas = porStatus.find(s => s.status === 'BAIXADA')?._count || 0;

    res.json({
      success: true,
      data: {
        total,
        disponiveis,
        emUso,
        manutencao,
        baixadas,
        taxaDisponibilidade: total > 0 ? Math.round((disponiveis / total) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - AUDITORIA
// ===========================================

// Listar auditoria
app.get('/api/auditoria', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tabela, usuario, dataInicio, dataFim, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.AuditoriaWhereInput = {
      ...(tabela && { tabela: tabela as string }),
      ...(usuario && { usuario: { contains: usuario as string, mode: 'insensitive' } }),
      ...(dataInicio && dataFim && {
        criadoEm: {
          gte: parseLocalDate(dataInicio as string),
          lte: endOfDay(parseLocalDate(dataFim as string))
        }
      })
    };

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take
      }),
      prisma.auditoria.count({ where })
    ]);

    res.json({
      success: true,
      data: registros,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===========================================
// ROTAS - UTILITÁRIAS
// ===========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Constantes do sistema
app.get('/api/constantes', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      postos: POSTOS.map(p => ({ value: p, label: POSTO_LABELS[p] })),
      tiposAfastamento: TIPOS_AFASTAMENTO,
      afastamentosSemEfetivo: AFASTAMENTOS_SEM_EFETIVO,
      codigosRestricao: CODIGOS_RESTRICAO_VALIDOS,
      codigosCriticos: CODIGOS_CRITICOS,
      statusViatura: STATUS_VIATURA,
      statusOcorrencia: STATUS_OCORRENCIA,
      tiposManutencao: TIPOS_MANUTENCAO
    }
  });
});

// ===========================================
// MIDDLEWARE DE ERRO (deve ser o último)
// ===========================================

app.use(errorHandler);

// ===========================================
// INICIAR SERVIDOR
// ===========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   SIGO - Sistema Integrado de Gestão Operacional              ║
║   4ª Companhia - 3º Batalhão de Polícia Ambiental             ║
║                                                               ║
║   Backend API v2.0.0                                          ║
║   Servidor rodando na porta ${PORT}                              ║
║                                                               ║
║   Endpoints disponíveis:                                      ║
║   - GET  /api/health           (Health check)                 ║
║   - GET  /api/constantes       (Constantes do sistema)        ║
║   - CRUD /api/policiais        (P/1 - Pessoal)                ║
║   - CRUD /api/afastamentos     (P/1 - Afastamentos)           ║
║   - CRUD /api/restricoes       (P/1 - Restrições)             ║
║   - CRUD /api/ocorrencias      (P/3 - Ocorrências)            ║
║   - CRUD /api/operacoes        (P/3 - Operações)              ║
║   - CRUD /api/viaturas         (P/4 - Viaturas)               ║
║   - CRUD /api/manutencoes      (P/4 - Manutenções)            ║
║   - GET  /api/dashboard/*      (Estatísticas)                 ║
║   - GET  /api/auditoria        (Logs de auditoria)            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
