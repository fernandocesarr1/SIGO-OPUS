/**
 * SIGO - Sistema Integrado de Gestão Operacional
 * Backend API - Express + Prisma
 *
 * 4ª Companhia - 3º Batalhão de Polícia Ambiental
 *
 * Arquitetura modular:
 *   config/     - Configurações, constantes, banco de dados
 *   middleware/  - CORS, auth, rate limiting, error handler
 *   schemas/    - Validação Zod por domínio
 *   services/   - Regras de negócio
 *   utils/      - Utilitários (data, auditoria, request)
 *   routes/     - Rotas organizadas por domínio
 */

import express from 'express';
import { corsMiddleware, rateLimitMiddleware, errorHandler } from './middleware';
import { registerRoutes } from './routes';

// ===========================================
// INICIALIZAÇÃO
// ===========================================

const app = express();

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Segurança
app.use(corsMiddleware);
app.use(rateLimitMiddleware);

// Logger de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ===========================================
// ROTAS
// ===========================================

registerRoutes(app);

// ===========================================
// MIDDLEWARE DE ERRO (deve ser o último)
// ===========================================

app.use(errorHandler);

// ===========================================
// INICIAR SERVIDOR
// ===========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   SIGO - Sistema Integrado de Gestão Operacional              ║
║   4ª Companhia - 3º Batalhão de Polícia Ambiental             ║
║                                                               ║
║   Backend API v2.1.0 (Modular)                                ║
║   Servidor rodando na porta ${PORT}                              ║
║                                                               ║
║   Módulos carregados:                                         ║
║   - Auth     /api/auth/*          (Autenticação JWT)          ║
║   - P/1      /api/policiais       (Pessoal)                   ║
║   - P/1      /api/afastamentos    (Afastamentos)              ║
║   - P/1      /api/restricoes      (Restrições)                ║
║   - P/3      /api/ocorrencias     (Ocorrências)               ║
║   - P/3      /api/operacoes       (Operações)                 ║
║   - P/4      /api/viaturas        (Viaturas)                  ║
║   - P/4      /api/manutencoes     (Manutenções)               ║
║   - P/4      /api/materiais       (Materiais)                 ║
║   - Dashboard /api/dashboard/*    (Estatísticas)              ║
║   - Auditoria /api/auditoria      (Logs)                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
