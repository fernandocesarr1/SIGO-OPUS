/**
 * SIGO - Utilitários de Auditoria
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

type OperacaoAuditoria = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

/**
 * Registra uma operação na tabela de auditoria
 */
export async function registrarAuditoria(
  tabela: string,
  registroId: number,
  operacao: OperacaoAuditoria,
  dadosAnteriores: any,
  dadosNovos: any,
  usuario: string,
  ip?: string
): Promise<void> {
  try {
    await prisma.auditoria.create({
      data: {
        tabela,
        registroId,
        operacao,
        dadosAnteriores: dadosAnteriores ? JSON.parse(JSON.stringify(dadosAnteriores)) : Prisma.JsonNull,
        dadosNovos: dadosNovos ? JSON.parse(JSON.stringify(dadosNovos)) : Prisma.JsonNull,
        usuario,
        ip: ip || null
      }
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}
