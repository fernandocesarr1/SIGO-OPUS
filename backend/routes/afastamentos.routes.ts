/**
 * SIGO - Rotas de Afastamentos (P/1)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { prisma } from '../config/database';
import { POSTO_LABELS, AFASTAMENTOS_SEM_EFETIVO } from '../config';
import { AfastamentoCreateSchema, AfastamentoUpdateSchema } from '../schemas';
import { verificarSobreposicaoAfastamento } from '../services';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate, formatDateBR } from '../utils';

const router = Router();

// GET /api/afastamentos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
        OR: [{ dataFim: { gte: hoje } }, { dataFim: null }, { indeterminado: true }]
      })
    };

    const [afastamentos, total] = await Promise.all([
      prisma.afastamento.findMany({
        where,
        include: { policial: { select: { id: true, re: true, nome: true, nomeGuerra: true, posto: true } } },
        orderBy: { dataInicio: 'desc' }, skip, take
      }),
      prisma.afastamento.count({ where })
    ]);

    res.json({
      success: true,
      data: afastamentos.map(a => ({ ...a, militar: `${POSTO_LABELS[a.policial.posto] || a.policial.posto} ${a.policial.nomeGuerra}` })),
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// GET /api/afastamentos/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const afastamento = await prisma.afastamento.findFirst({ where: { id: parseInt(id), excluido: false }, include: { policial: true } });
    if (!afastamento) return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });
    res.json({ success: true, data: afastamento });
  } catch (error) { next(error); }
});

// POST /api/afastamentos
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AfastamentoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const policial = await prisma.policial.findUnique({ where: { id: data.policialId } });
    if (!policial) return res.status(404).json({ success: false, error: 'Policial não encontrado' });

    const dataInicio = parseLocalDate(data.dataInicio);
    const dataFim = data.dataFim ? parseLocalDate(data.dataFim) : null;

    const conflito = await verificarSobreposicaoAfastamento(data.policialId, dataInicio, dataFim, data.indeterminado || false);
    if (conflito) {
      return res.status(409).json({
        success: false,
        error: `CONFLITO: Já existe afastamento no período. Tipo: ${conflito.tipo}, Início: ${formatDateBR(conflito.dataInicio)}`
      });
    }

    const contaEfetivo = !AFASTAMENTOS_SEM_EFETIVO.includes(data.tipo);
    const warnings: string[] = [];
    if (!contaEfetivo) warnings.push('Este tipo de afastamento NÃO cunta como efetivo exercício para aposentadoria/promoção.');

    const afastamento = await prisma.afastamento.create({
      data: { ...data, dataInicio, dataFim, contaEfetivoExercicio: contaEfetivo, criadoPorUsuario: usuario },
      include: { policial: true }
    });

    await registrarAuditoria('afastamentos', afastamento.id, 'CREATE', null, afastamento, usuario, ip);
    res.status(201).json({ success: true, data: afastamento, warnings });
  } catch (error) { next(error); }
});

// PUT /api/afastamentos/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = AfastamentoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.afastamento.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });

    if (data.dataInicio || data.dataFim) {
      const dI = data.dataInicio ? parseLocalDate(data.dataInicio) : anterior.dataInicio;
      const dF = data.dataFim ? parseLocalDate(data.dataFim) : anterior.dataFim;
      const indet = data.indeterminado !== undefined ? data.indeterminado : anterior.indeterminado;

      const conflito = await verificarSobreposicaoAfastamento(anterior.policialId, dI, dF, indet, parseInt(id));
      if (conflito) return res.status(409).json({ success: false, error: `CONFLITO: Já existe afastamento no período. Tipo: ${conflito.tipo}` });
    }

    const contaEfetivo = data.tipo ? !AFASTAMENTOS_SEM_EFETIVO.includes(data.tipo) : anterior.contaEfetivoExercicio;

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
  } catch (error) { next(error); }
});

// DELETE /api/afastamentos/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.afastamento.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Afastamento não encontrado' });

    const afastamento = await prisma.afastamento.update({ where: { id: parseInt(id) }, data: { excluido: true } });
    await registrarAuditoria('afastamentos', afastamento.id, 'DELETE', anterior, afastamento, usuario, ip);

    res.json({ success: true, message: 'Afastamento excluído com sucesso' });
  } catch (error) { next(error); }
});

export default router;
