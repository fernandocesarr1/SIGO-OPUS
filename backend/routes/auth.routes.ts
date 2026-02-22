/**
 * SIGO - Rotas de Autenticação
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { JWTPayload, AuthenticatedRequest, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from '../config';
import { LoginSchema, AlterarSenhaSchema } from '../schemas';
import { authMiddleware, hashPassword, verifyPassword, generateToken } from '../middleware';
import { getClientIP, registrarAuditoria } from '../utils';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, senha } = LoginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: {
        policial: {
          select: { id: true, nome: true, nomeGuerra: true, posto: true }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Usuário ou senha inválidos' });
    }

    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoAte.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Conta bloqueada. Tente novamente em ${minutosRestantes} minutos.`
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        success: false,
        error: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    const senhaValida = await verifyPassword(senha, usuario.senhaHash);

    if (!senhaValida) {
      const novasTentativas = usuario.tentativasLogin + 1;
      const updateData: any = { tentativasLogin: novasTentativas };

      if (novasTentativas >= MAX_LOGIN_ATTEMPTS) {
        updateData.bloqueadoAte = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
        updateData.tentativasLogin = 0;
      }

      await prisma.usuario.update({ where: { id: usuario.id }, data: updateData });

      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha inválidos',
        tentativasRestantes: novasTentativas >= MAX_LOGIN_ATTEMPTS ? 0 : MAX_LOGIN_ATTEMPTS - novasTentativas
      });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasLogin: 0, bloqueadoAte: null, ultimoAcesso: new Date() }
    });

    const payload: JWTPayload = {
      userId: usuario.id,
      username: usuario.username,
      perfil: usuario.perfil,
      secao: usuario.secao
    };

    const token = generateToken(payload);

    const tokenHash = await hashPassword(token.substring(0, 50));
    await prisma.sessaoUsuario.create({
      data: {
        usuarioId: usuario.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent']?.substring(0, 500)
      }
    });

    await registrarAuditoria('usuarios', usuario.id, 'UPDATE', null, { action: 'LOGIN' }, usuario.username, getClientIP(req));

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          perfil: usuario.perfil,
          secao: usuario.secao,
          policial: usuario.policial
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Não autenticado' });

    await prisma.sessaoUsuario.deleteMany({ where: { usuarioId: req.user.userId } });
    await registrarAuditoria('usuarios', req.user.userId, 'UPDATE', null, { action: 'LOGOUT' }, req.user.username, getClientIP(req));

    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Não autenticado' });

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, username: true, perfil: true, secao: true, ativo: true,
        ultimoAcesso: true, criadoEm: true,
        policial: {
          select: {
            id: true, re: true, nome: true, nomeGuerra: true, posto: true, funcao: true,
            subunidade: { select: { id: true, nome: true, sigla: true } }
          }
        }
      }
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ success: false, error: 'Usuário não encontrado ou desativado' });
    }

    res.json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/senha
router.put('/senha', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Não autenticado' });

    const { senhaAtual, novaSenha } = AlterarSenhaSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.userId } });
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    const senhaValida = await verifyPassword(senhaAtual, usuario.senhaHash);
    if (!senhaValida) return res.status(401).json({ success: false, error: 'Senha atual incorreta' });

    const novaHash = await hashPassword(novaSenha);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { senhaHash: novaHash } });
    await prisma.sessaoUsuario.deleteMany({ where: { usuarioId: usuario.id } });
    await registrarAuditoria('usuarios', usuario.id, 'UPDATE', null, { action: 'PASSWORD_CHANGE' }, usuario.username, getClientIP(req));

    res.json({ success: true, message: 'Senha alterada com sucesso. Faça login novamente.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/check
router.get('/check', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: { valid: true, user: req.user } });
});

export default router;
