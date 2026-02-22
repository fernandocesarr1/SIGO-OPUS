/**
 * SIGO - Rotas de Auditoria e Subunidades
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { endOfDay } from 'date-fns';
import { prisma } from '../config/database';
import { parseLocalDate } from '../utils';

const router = Router();

// GET /api/auditoria
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tabela, usuario, dataInicio, dataFim, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);

    const where: Prisma.AuditoriaWhereInput = {
      ...(tabela && { tabela: tabela as string }),
      ...(usuario && { usuario: { contains: usuario as string, mode: 'insensitive' } }),
      ...(dataInicio && dataFim && {
        criadoEm: { gte: parseLocalDate(dataInicio as string), lte: endOfDay(parseLocalDate(dataFim as string)) }
      })
    };

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({ where, orderBy: { criadoEm: 'desc' }, skip, take }),
      prisma.auditoria.count({ where })
    ]);

    res.json({
      success: true, data: registros,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

export default router;
