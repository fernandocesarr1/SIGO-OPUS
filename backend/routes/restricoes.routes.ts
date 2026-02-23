/**
 * SIGO - Rotas de Restrições (P/1)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { prisma } from '../config/database';
import { POSTO_LABELS, CODIGOS_CRITICOS } from '../config';
import { RestricaoCreateSchema, RestricaoUpdateSchema } from '../schemas';
import { aplicarRegrasRestricao } from '../services';
import { getUsuario, getClientIP, registrarAuditoria, parseLocalDate } from '../utils';

const router = Router();

// GET /api/restricoes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { policialId, ativo, critico, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 100);
    const hoje = startOfDay(new Date());

    const where: Prisma.RestricaoWhereInput = {
      excluido: false,
      ...(policialId && { policialId: parseInt(policialId as string) }),
      ...(critico === 'true' && { temCodigoCritico: true }),
      ...(ativo === 'true' && { dataInicio: { lte: hoje }, dataFim: { gte: hoje } })
    };

    const [restricoes, total] = await Promise.all([
      prisma.restricao.findMany({
        where,
        include: { policial: { select: { id: true, re: true, nome: true, nomeGuerra: true, posto: true } } },
        orderBy: { dataFim: 'asc' }, skip, take
      }),
      prisma.restricao.count({ where })
    ]);

    res.json({
      success: true,
      data: restricoes.map(r => ({ ...r, militar: `${POSTO_LABELS[r.policial.posto] || r.policial.posto} ${r.policial.nomeGuerra}` })),
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) }
    });
  } catch (error) { next(error); }
});

// GET /api/restricoes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const restricao = await prisma.restricao.findFirst({ where: { id: parseInt(id), excluido: false }, include: { policial: true } });
    if (!restricao) return res.status(404).json({ success: false, error: 'Restrição não encontrada' });
    res.json({ success: true, data: restricao });
  } catch (error) { next(error); }
});

// POST /api/restricoes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RestricaoCreateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const policial = await prisma.policial.findUnique({ where: { id: data.policialId } });
    if (!policial) return res.status(404).json({ success: false, error: 'Policial não encontrado' });

    const { finalCodigos, warnings } = aplicarRegrasRestricao(data.codigos);
    const temCritico = finalCodigos.some(c => CODIGOS_CRITICOS.includes(c));

    if (data.parecerMedico) {
      const termosSigilosos = ['HIV', 'AIDS', 'CÂNCER', 'CANCER', 'PSIQUIAT', 'MENTAL', 'DEPRESSÃO', 'DEPRESSAO'];
      const contemSigilo = termosSigilosos.some(t => data.parecerMedico!.toUpperCase().includes(t));
      if (contemSigilo) warnings.push('ATENÇÃO: O parecer médico pode conter informações sigilosas. Verifique a conformidade com a legislação de sigilo médico.');
    }

    const restricao = await prisma.restricao.create({
      data: {
        ...data, codigos: finalCodigos,
        dataInicio: parseLocalDate(data.dataInicio), dataFim: parseLocalDate(data.dataFim),
        temCodigoCritico: temCritico, criadoPorUsuario: usuario
      },
      include: { policial: true }
    });

    await registrarAuditoria('restricoes', restricao.id, 'CREATE', null, restricao, usuario, ip);
    res.status(201).json({ success: true, data: restricao, warnings });
  } catch (error) { next(error); }
});

// PUT /api/restricoes/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = RestricaoUpdateSchema.parse(req.body);
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.restricao.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Restrição não encontrada' });

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
        ...data, codigos: finalCodigos,
        dataInicio: data.dataInicio ? parseLocalDate(data.dataInicio) : undefined,
        dataFim: data.dataFim ? parseLocalDate(data.dataFim) : undefined,
        temCodigoCritico: temCritico
      },
      include: { policial: true }
    });

    await registrarAuditoria('restricoes', restricao.id, 'UPDATE', anterior, restricao, usuario, ip);
    res.json({ success: true, data: restricao, warnings });
  } catch (error) { next(error); }
});

// DELETE /api/restricoes/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = getUsuario(req);
    const ip = getClientIP(req);

    const anterior = await prisma.restricao.findFirst({ where: { id: parseInt(id), excluido: false } });
    if (!anterior) return res.status(404).json({ success: false, error: 'Restrição não encontrada' });

    const restricao = await prisma.restricao.update({ where: { id: parseInt(id) }, data: { excluido: true } });
    await registrarAuditoria('restricoes', restricao.id, 'DELETE', anterior, restricao, usuario, ip);

    res.json({ success: true, message: 'Restrição excluída com sucesso' });
  } catch (error) { next(error); }
});

export default router;
