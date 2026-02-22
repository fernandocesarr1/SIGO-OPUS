/**
 * SIGO - Rotas do Dashboard
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { startOfDay, addDays } from 'date-fns';
import { prisma } from '../config/database';
import { POSTO_LABELS, DATA_ULTIMA_ATUALIZACAO_EFETIVO, POSTOS, TIPOS_AFASTAMENTO, AFASTAMENTOS_SEM_EFETIVO, CODIGOS_RESTRICAO_VALIDOS, CODIGOS_CRITICOS, STATUS_VIATURA, STATUS_OCORRENCIA, TIPOS_MANUTENCAO } from '../config';
import { calcularStatusOperacional } from '../services';
import { parseLocalDate } from '../utils';

const router = Router();

// GET /api/dashboard/efetivo
router.get('/efetivo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hoje = startOfDay(new Date());
    const totalPoliciais = await prisma.policial.count({ where: { ativo: true } });

    const policiais = await prisma.policial.findMany({
      where: { ativo: true },
      include: { afastamentos: { where: { excluido: false } }, restricoes: { where: { excluido: false } } }
    });

    let aptos = 0, comRestricao = 0, afastados = 0;
    policiais.forEach(p => {
      const status = calcularStatusOperacional(p);
      if (status === 'APTO') aptos++;
      else if (status === 'APTO_COM_RESTRICAO') comRestricao++;
      else if (status === 'AFASTADO') afastados++;
    });

    const porPosto = await prisma.policial.groupBy({ by: ['posto'], where: { ativo: true }, _count: true });

    res.json({
      success: true,
      data: {
        total: totalPoliciais, aptos, comRestricao, afastados,
        ultimaAtualizacao: DATA_ULTIMA_ATUALIZACAO_EFETIVO,
        porPosto: porPosto.map(p => ({ posto: p.posto, postoLabel: POSTO_LABELS[p.posto] || p.posto, quantidade: p._count }))
      }
    });
  } catch (error) { next(error); }
});

// GET /api/dashboard/vencimentos
router.get('/vencimentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dias = parseInt(req.query.dias as string) || 7;
    const hoje = startOfDay(new Date());
    const limite = addDays(hoje, dias);

    const [afastamentos, restricoes] = await Promise.all([
      prisma.afastamento.findMany({
        where: { excluido: false, indeterminado: false, dataFim: { gte: hoje, lte: limite } },
        include: { policial: { select: { posto: true, nomeGuerra: true } } },
        orderBy: { dataFim: 'asc' }
      }),
      prisma.restricao.findMany({
        where: { excluido: false, dataFim: { gte: hoje, lte: limite } },
        include: { policial: { select: { posto: true, nomeGuerra: true } } },
        orderBy: { dataFim: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        afastamentos: afastamentos.map(a => ({
          id: a.id,
          militar: `${POSTO_LABELS[a.policial.posto] || a.policial.posto} ${a.policial.nomeGuerra}`,
          tipo: a.tipo, vencimento: a.dataFim,
          diasRestantes: Math.ceil((a.dataFim!.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        })),
        restricoes: restricoes.map(r => ({
          id: r.id,
          militar: `${POSTO_LABELS[r.policial.posto] || r.policial.posto} ${r.policial.nomeGuerra}`,
          codigos: r.codigos, vencimento: r.dataFim,
          diasRestantes: Math.ceil((r.dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)),
          critico: r.temCodigoCritico
        }))
      }
    });
  } catch (error) { next(error); }
});

// GET /api/dashboard/alertas
router.get('/alertas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hoje = startOfDay(new Date());
    const em7dias = addDays(hoje, 7);

    const restricoesCriticas = await prisma.restricao.findMany({
      where: { excluido: false, temCodigoCritico: true, dataInicio: { lte: hoje }, dataFim: { gte: hoje } },
      include: { policial: { select: { posto: true, nomeGuerra: true, re: true } } }
    });

    const viaturasManutencao = await prisma.viatura.findMany({ where: { status: 'MANUTENCAO', ativo: true } });

    const afastamentosVencendo = await prisma.afastamento.count({
      where: { excluido: false, indeterminado: false, dataFim: { gte: hoje, lte: em7dias } }
    });

    const materiaisBaixoEstoque = await prisma.material.findMany({ where: { ativo: true } });
    const materiaisAlerta = materiaisBaixoEstoque.filter(m => m.quantidadeAtual <= m.quantidadeMinima);

    res.json({
      success: true,
      data: {
        restricoesCriticas: restricoesCriticas.map(r => ({
          id: r.id, militar: `${POSTO_LABELS[r.policial.posto]} ${r.policial.nomeGuerra}`,
          re: r.policial.re, codigos: r.codigos, vencimento: r.dataFim
        })),
        viaturasManutencao: viaturasManutencao.map(v => ({ id: v.id, prefixo: v.prefixo, modelo: v.modelo })),
        afastamentosVencendo,
        materiaisAlerta: materiaisAlerta.length,
        totalAlertas: restricoesCriticas.length + viaturasManutencao.length +
                      (afastamentosVencendo > 0 ? 1 : 0) + (materiaisAlerta.length > 0 ? 1 : 0)
      }
    });
  } catch (error) { next(error); }
});

// GET /api/dashboard/ocorrencias
router.get('/ocorrencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { periodo = '30' } = req.query;
    const dias = parseInt(periodo as string);
    const dataInicio = addDays(startOfDay(new Date()), -dias);

    const totalOcorrencias = await prisma.ocorrencia.count({ where: { excluido: false, dataHora: { gte: dataInicio } } });

    const porStatus = await prisma.ocorrencia.groupBy({
      by: ['status'], where: { excluido: false, dataHora: { gte: dataInicio } }, _count: true
    });

    const porTipo = await prisma.ocorrencia.groupBy({
      by: ['tipoId'], where: { excluido: false, dataHora: { gte: dataInicio } },
      _count: true, orderBy: { _count: { tipoId: 'desc' } }, take: 5
    });

    const tipoIds = porTipo.map(t => t.tipoId);
    const tipos = await prisma.tipoOcorrencia.findMany({ where: { id: { in: tipoIds } } });

    const autosInfracao = await prisma.ocorrencia.count({
      where: { excluido: false, dataHora: { gte: dataInicio }, autoInfracao: { not: null } }
    });

    const areaTotal = await prisma.ocorrencia.aggregate({
      where: { excluido: false, dataHora: { gte: dataInicio }, areaPatrulhadaKm: { not: null } },
      _sum: { areaPatrulhadaKm: true }
    });

    res.json({
      success: true,
      data: {
        total: totalOcorrencias, autosInfracao,
        areaPatrulhadaKm: areaTotal._sum.areaPatrulhadaKm || 0,
        porStatus: porStatus.map(s => ({ status: s.status, quantidade: s._count })),
        porTipo: porTipo.map(t => {
          const tipo = tipos.find(tp => tp.id === t.tipoId);
          return { tipo: tipo?.nome || 'Desconhecido', quantidade: t._count };
        })
      }
    });
  } catch (error) { next(error); }
});

// GET /api/dashboard/viaturas
router.get('/viaturas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const porStatus = await prisma.viatura.groupBy({ by: ['status'], where: { ativo: true }, _count: true });
    const total = await prisma.viatura.count({ where: { ativo: true } });

    const disponiveis = porStatus.find(s => s.status === 'DISPONIVEL')?._count || 0;
    const emUso = porStatus.find(s => s.status === 'EM_USO')?._count || 0;
    const manutencao = porStatus.find(s => s.status === 'MANUTENCAO')?._count || 0;
    const baixadas = porStatus.find(s => s.status === 'BAIXADA')?._count || 0;

    res.json({
      success: true,
      data: { total, disponiveis, emUso, manutencao, baixadas, taxaDisponibilidade: total > 0 ? Math.round((disponiveis / total) * 100) : 0 }
    });
  } catch (error) { next(error); }
});

// GET /api/subunidades
router.get('/subunidades-list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subunidades = await prisma.subunidade.findMany({
      where: { ativo: true },
      include: { _count: { select: { policiais: true } } },
      orderBy: { nome: 'asc' }
    });
    res.json({ success: true, data: subunidades });
  } catch (error) { next(error); }
});

// GET /api/constantes
router.get('/constantes', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      postos: POSTOS.map(p => ({ value: p, label: POSTO_LABELS[p] })),
      tiposAfastamento: TIPOS_AFASTAMENTO,
      afastamentosSemEfetivo: AFASTAMENTOS_SEM_EFETIVO,
      codigosRestricao: CODIGOS_RESTRICAO_VALIDOS,
      codigosCriticos: CODBGOS_CRITICOS,
      statusViatura: STATUS_VIATURA,
      statusOcorrencia: STATUS_OCORRENCIA,
      tiposManutencao: TIPOS_MANUTENCAO
    }
  });
});

export default router;
