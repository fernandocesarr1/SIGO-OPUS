/**
 * SIGO - Utilitários de Request
 */

import { Request } from 'express';

/**
 * Obtém o usuário do header X-Usuario ou retorna 'SISTEMA'
 */
export function getUsuario(req: Request): string {
  return (req.headers['x-usuario'] as string) || 'SISTEMA';
}

/**
 * Obtém o IP do cliente (considerando proxies)
 */
export function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.socket.remoteAddress ||
         'unknown';
}
