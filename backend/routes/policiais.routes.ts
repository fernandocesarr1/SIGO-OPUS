/**
 * SIGO - Rotas de Policiais (P/1)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { POSTO_LABELS } from '../config';
import { PolicialCreateSchema, PolicialUpdateSchema } from '../schemas';
import { calcularStatusOperacional } from '../services';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate } from '../utils';

const router = Router();

// GET /api/policiais
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', busca, posto, subunidadeId, status, ativo = 'true' } = req.query;

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
          afastamentos: { where: { excluido: false }, orderBy: { dataInicio: 'desc' }, take: 1 },
          restricoes: { where: { excluido: false }, orderBy: { dataFim: 'desc' }, take: 5 }
        },
        orderBy: [{ posto: 'desc' }, { nomeGuerra: 'asc' }],
        skip, take
      }),
      prisma.policial.count({ where })
    ]);

    const policiaisComStatus = policiais.map(p => ({
      ...p,
      statusOperacional: calcularStatusOperacional(p),
      postoLabel: POSTO_LABELS[p.posto] || p.posto
    }));

    let resultado = policiaisComStatus;
    if (status) {
      resultado = policiaisComStatus.filter(p => p.statusOperacional === status);
    }

    res.json({
      success: true,
      data: resultado,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// GET /api/policiais/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const policial = await prisma.policial.findUnique({
      where: { id: parseInt(id) },
      include: {
        subunidade: true,
        afastamentos: { where: { excluido: false }, orderBy: { dataInicio: 'desc' } },
        restricoes: { where: { excluido: false }, orderBy: { dataFim: 'desc' } }
      }
    });

    if (!policial) return res.status(404).json({ success: false, error: 'Policial não encontrado' });

    res.json({
      success: true,
      data: { ...policial, statusOperacional: calcularStatusOperacional(policial), postoLabel: POSTO_LABELS[policial.posto] || policial.posto }
    });
  } catch (error) { next(error); }
});

// POST /api/policiais
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = PolicialCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const existente = await prisma.policial.findUnique({ where: { re: data.re } });
    if (existente) return res.status(409).json({ success: false, error: 'RE já cadastrado no sistema' });

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
  } catch (error) { next(error); }
});

// PUT /api/policiais/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = PolicialUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.policial.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Policial não encontrado' });

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
  } catch (error) { next(error); }
});

// DELETE /api/policiais/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.policial.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Policial não encontrado' });

    const policial = await prisma.policial.update({ where: { id: parseInt(id) }, data: { ativo: false } });
    await registrarAuditoria('policiais', policial.id, 'DELETE', anterior, policial, usuario, ip);

    res.json({ success: true, message: 'Policial desativado com sucesso' });
  } catch (error) { next(error); }
});

export default router;
