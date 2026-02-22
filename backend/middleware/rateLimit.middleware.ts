/**
 * SIGO - Middleware de Rate Limiting
 */

import { Request, Response, NextFunction } from 'express';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '../config';

// Store para rate limiting (em memória)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Limpar entradas antigas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = `${clientIp}`;
  const now = Date.now();

  const clientData = rateLimitStore.get(key);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.header('Retry-After', String(Math.ceil((clientData.resetTime - now) / 1000)));
    return res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente em alguns segundos.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }

  clientData.count++;
  next();
}
