/**
 * SIGO - Rotas de Manutenções (P/4)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ManutencaoCreateSchema, ManutencaoUpdateSchema } from '../schemas';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate } from '../utils';

const router = Router();

// GET /api/manutencoes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
        include: { viatura: { select: { id: true, prefixo: true, modelo: true, placa: true } } },
        orderBy: { dataEntrada: 'desc' }, skip, take
      }),
      prisma.manutencao.count({ where })
    ]);

    res.json({
      success: true, data: manutencoes,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// POST /api/manutencoes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ManutencaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const viatura = await prisma.viatura.findUnique({ where: { id: data.viaturaId } });
    if (!viatura) return res.status(404).json({ success: false, error: 'Viatura não encontrada' });

    await prisma.viatura.update({ where: { id: data.viaturaId }, data: { status: 'MANUTENCAO' } });

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
  } catch (error) { next(error); }
});

// PUT /api/manutencoes/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = ManutencaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.manutencao.findUnique({ where: { id: parseInt(id) } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Manutenção não encontrada' });

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

    if (data.concluida === true) {
      await prisma.viatura.update({
        where: { id: anterior.viaturaId },
        data: { status: 'DISPONIVEL', kmAtual: data.kmSaida || anterior.kmSaida || anterior.kmEntrada }
      });
    }

    await registrarAuditoria('manutencoes', manutencao.id, 'UPDATE', anterior, manutencao, usuario, ip);
    res.json({ success: true, data: manutencao });
  } catch (error) { next(error); }
});

export default router;
