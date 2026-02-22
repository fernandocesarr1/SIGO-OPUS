/**
 * SIGO - Middleware de Tratamento de Erros
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Erro:', err);

  // Erro de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.errors.map(e => ({ campo: e.path.join('.'), mensagem: e.message }))
    });
  }

  // Erros conhecidos do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Registro duplicado. Já existe um registro com estes dados únicos.'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado.'
      });
    }
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
