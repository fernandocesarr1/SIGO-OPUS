/**
 * SIGO - Middleware de Autenticação JWT
 */

import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PerfilUsuario } from '@prisma/client';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_ROUNDS,
  JWTPayload,
  AuthenticatedRequest
} from '../config';

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ===========================================
// MIDDLEWARES
// ===========================================

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona user ao request
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido'
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }

  req.user = payload;
  next();
}

/**
 * Middleware de autorização por perfil
 * Verifica se o usuário tem um dos perfis permitidos
 */
export function requirePerfil(...perfisPermitidos: PerfilUsuario[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Perfil insuficiente para esta operação.'
      });
    }

    next();
  };
}

/**
 * Middleware para verificar acesso à seção (P/1, P/3, P/4)
 * Comandante e Admin têm acesso a todas as seções
 */
export function requireSecao(...secoesPermitidas: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Comandante e Admin têm acesso a todas as seções
    if (req.user.perfil === 'COMANDANTE' || req.user.perfil === 'ADMIN_SISTEMA') {
      return next();
    }

    // Chefe de seção só acessa sua seção
    if (req.user.perfil === 'CHEFE_SECAO') {
      if (!req.user.secao || !secoesPermitidas.includes(req.user.secao)) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado. Você não tem permissão para esta seção.'
        });
      }
    }

    next();
  };
}
