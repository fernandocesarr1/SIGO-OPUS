/**
 * SIGO - Rotas de Ocorrências (P/3)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { endOfDay } from 'date-fns';
import { prisma } from '../config/database';
import { OcorrenciaCreateSchema, OcorrenciaUpdateSchema } from '../schemas';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate } from '../utils';

const router = Router();

// GET /api/tipos-ocorrencia
router.get('/tipos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tipos = await prisma.tipoOcorrencia.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } });
    res.json({ success: true, data: tipos });
  } catch (error) { next(error); }
});

// POST /api/tipos-ocorrencia
router.post('/tipos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, descricao } = req.body;
    const tipo = await prisma.tipoOcorrencia.create({ data: { nome, descricao } });
    res.status(201).json({ success: true, data: tipo });
  } catch (error) { next(error); }
});

// GET /api/ocorrencias
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { busca, tipoId, status, municipio, dataInicio, dataFim, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.OcorrenciaWhereInput = {
      excluido: false,
      ...(tipoId && { tipoId: parseInt(tipoId as string) }),
      ...(status && { status: status as any }),
      ...(municipio && { municipio: { contains: municipio as string, mode: 'insensitive' } }),
      ...(dataInicio && dataFim && {
        dataHora: { gte: parseLocalDate(dataInicio as string), lte: endOfDay(parseLocalDate(dataFim as string)) }
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
          policialResponsavel: { select: { id: true, nomeGuerra: true, posto: true } },
          viatura: { select: { id: true, prefixo: true, modelo: true } }
        },
        orderBy: { dataHora: 'desc' }, skip, take
      }),
      prisma.ocorrencia.count({ where })
    ]);

    res.json({
      success: true, data: ocorrencias,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// GET /api/ocorrencias/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ocorrencia = await prisma.ocorrencia.findFirst({
      where: { id: parseInt(id), excluido: false },
      include: { tipo: true, policialResponsavel: true, viatura: true }
    });
    if (!ocorrencia) return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });
    res.json({ success: true, data: ocorrencia });
  } catch (error) { next(error); }
});

// POST /api/ocorrencias
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) { next(error); }
});

// PUT /api/ocorrencias/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = OcorrenciaUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.ocorrencia.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });

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
  } catch (error) { next(error); }
});

// DELETE /api/ocorrencias/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.ocorrencia.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Ocorrência não encontrada' });

    const ocorrencia = await prisma.ocorrencia.update({ where: { id: parseInt(id) }, data: { excluido: true } });
    await registrarAuditoria('ocorrencias', ocorrencia.id, 'DELETE', anterior, ocorrencia, usuario, ip);

    res.json({ success: true, message: 'Ocorrência excluída com sucesso' });
  } catch (error) { next(error); }
});

export default router;
