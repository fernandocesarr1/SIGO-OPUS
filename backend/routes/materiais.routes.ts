/**
 * SIGO - Rotas de Materiais (P/4)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// GET /api/materiais
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoria, estoqueMinimo, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.MaterialWhereInput = {
      ativo: true,
      ...(categoria && { categoria: categoria as string })
    };

    const [materiais, total] = await Promise.all([
      prisma.material.findMany({ where, orderBy: { nome: 'asc' }, skip, take }),
      prisma.material.count({ where })
    ]);

    let resultado = materiais;
    if (estoqueMinimo === 'true') {
      resultado = materiais.filter(m => m.quantidadeAtual <= m.quantidadeMinima);
    }

    res.json({
      success: true,
      data: resultado.map(m => ({ ...m, estoqueStatus: m.quantidadeAtual <= m.quantidadeMinima ? 'BAIXO' : 'OK' })),
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

export default router;
