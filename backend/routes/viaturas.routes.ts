/**
 * SIGO - Rotas de Viaturas (P/4)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ViaturaCreateSchema, ViaturaUpdateSchema } from '../schemas';

const router = Router();

// GET /api/viaturas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
        where, include: { manutencoes: { where: { concluida: false }, take: 1 } },
        orderBy: { prefixo: 'asc' }, skip, take
      }),
      prisma.viatura.count({ where })
    ]);

    res.json({
      success: true,
      data: viaturas.map(v => ({ ...v, emManutencao: v.manutencoes.length > 0 })),
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// GET /api/viaturas/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const viatura = await prisma.viatura.findFirst({
      where: { id: parseInt(id), ativo: true },
      include: { manutencoes: { orderBy: { dataEntrada: 'desc' }, take: 10 } }
    });
    if (!viatura) return res.status(404).json({ success: false, error: 'Viatura não encontrada' });
    res.json({ success: true, data: viatura });
  } catch (error) { next(error); }
});

// POST /api/viaturas
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ViaturaCreateSchema.parse(req.body);
    const viatura = await prisma.viatura.create({ data });
    res.status(201).json({ success: true, data: viatura });
  } catch (error) { next(error); }
});

// PUT /api/viaturas/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = ViaturaUpdateSchema.parse(req.body);
    const viatura = await prisma.viatura.update({ where: { id: parseInt(id) }, data });
    res.json({ success: true, data: viatura });
  } catch (error) { next(error); }
});

// DELETE /api/viaturas/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.viatura.update({ where: { id: parseInt(id) }, data: { ativo: false } });
    res.json({ success: true, message: 'Viatura desativada com sucesso' });
  } catch (error) { next(error); }
});

export default router;
