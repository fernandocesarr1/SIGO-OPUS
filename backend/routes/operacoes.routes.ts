/**
 * SIGO - Rotas de Operações (P/3)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { OperacaoCreateSchema, OperacaoUpdateSchema } from '../schemas';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate } from '../utils';

const router = Router();

// GET /api/operacoes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ativa, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.OperacaoWhereInput = {
      ...(ativa !== undefined && { ativa: ativa === 'true' })
    };

    const [operacoes, total] = await Promise.all([
      prisma.operacao.findMany({ where, orderBy: { dataInicio: 'desc' }, skip, take }),
      prisma.operacao.count({ where })
    ]);

    res.json({
      success: true, data: operacoes,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// POST /api/operacoes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = OperacaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const operacao = await prisma.operacao.create({
      data: { ...data, dataInicio: parseLocalDate(data.dataInicio), dataFim: data.dataFim ? parseLocalDate(data.dataFim) : null, criadoPorUsuario: usuario }
    });

    await registrarAuditoria('operacoes', operacao.id, 'CREATE', null, operacao, usuario, ip);
    res.status(201).json({ success: true, data: operacao });
  } catch (error) { next(error); }
});

// PUT /api/operacoes/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = OperacaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.operacao.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Operação não encontrada' });

    const operacao = await prisma.operacao.update({
      where: { id: parseInt(id) },
      data: { ...data, dataInicio: data.dataInicio ? parseLocalDate(data.dataInicio) : undefined, dataFim: data.dataFim ? parseLocalDate(data.dataFim) : undefined }
    });

    await registrarAuditoria('operacoes', operacao.id, 'UPDATE', anterior, operacao, usuario, ip);
    res.json({ success: true, data: operacao });
  } catch (error) { next(error); }
});

export default router;
