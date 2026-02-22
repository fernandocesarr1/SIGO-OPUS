/**
 * SIGO - Registro Central de Rotas
 */

import { Express, Request, Response } from 'express';
import authRoutes from './auth.routes';
import policiaisRoutes from './policiais.routes';
import afastamentosRoutes from './afastamentos.routes';
import restricoesRoutes from './restricoes.routes';
import ocorrenciasRoutes from './ocorrencias.routes';
import operacoesRoutes from './operacoes.routes';
import viaturasRoutes from './viaturas.routes';
import manutencoesRoutes from './manutencoes.routes';
import materiaisRoutes from './materiais.routes';
import dashboardRoutes from './dashboard.routes';
import auditoriaRoutes from './auditoria.routes';
import { prisma } from '../config/database';

export function registerRoutes(app: Express): void {
  // Autenticação
  app.use('/api/auth', authRoutes);

  // P/1 - Pessoal
  app.use('/api/policiais', policiaisRoutes);
  app.use('/api/afastamentos', afastamentosRoutes);
  app.use('/api/restricoes', restricoesRoutes);

  // P/3 - Operações
  app.use('/api/tipos-ocorrencia', ocorrenciasRoutes);
  app.use('/api/ocorrencias', ocorrenciasRoutes);
  app.use('/api/operacoes', operacoesRoutes);

  // P/4 - Logística
  app.use('/api/viaturas', viaturasRoutes);
  app.use('/api/manutencoes', manutencoesRoutes);
  app.use('/api/materiais', materiaisRoutes);

  // Dashboard e Estatísticas
  app.use('/api/dashboard', dashboardRoutes);

  // Auditoria
  app.use('/api/auditoria', auditoriaRoutes);

  // Subunidades
  app.get('/api/subunidades', async (req: Request, res: Response, next) => {
    try {
      const subunidades = await prisma.subunidade.findMany({
        where: { ativo: true },
        include: { _count: { select: { policiais: true } } },
        orderBy: { nome: 'asc' }
      });
      res.json({ success: true, data: subunidades });
    } catch (error) { next(error); }
  });

  // Subunidades - criar
  app.post('/api/subunidades', async (req: Request, res: Response, next) => {
    try {
      const { nome, sigla } = req.body;
      const subunidade = await prisma.subunidade.create({ data: { nome, sigla } });
      res.status(201).json({ success: true, data: subunidade });
    } catch (error) { next(error); }
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0' });
  });

  // Constantes
  app.use('/api', dashboardRoutes);
}
