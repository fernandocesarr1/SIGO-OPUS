/**
 * SIGO - Configurações e Constantes do Sistema
 */

import { Request } from 'express';
import { PerfilUsuario } from '@prisma/client';

// ===========================================
// CONSTANTES DE DOMÍNIO
// ===========================================

export const POSTOS = ['SD', 'CB', 'SGT3', 'SGT2', 'SGT1', 'SUBTEN', 'TEN2', 'TEN1', 'CAP'] as const;

export const DATA_ULTIMA_ATUALIZACAO_EFETIVO = '2025-01-02';

export const POSTO_LABELS: Record<string, string> = {
  SD: 'Sd PM',
  CB: 'Cb PM',
  SGT3: '3º Sgt PM',
  SGT2: '2º Sgt PM',
  SGT1: '1º Sgt PM',
  SUBTEN: 'Subten PM',
  TEN2: '2º Ten PM',
  TEN1: '1º Ten PM',
  CAP: 'Cap PM',
};

export const TIPOS_AFASTAMENTO = [
  'FERIAS', 'LICENCA_PREMIO', 'LICENCA_SAUDE_FAMILIA', 'LTS', 'CONVALESCENCA',
  'LICENCA_GESTANTE', 'LICENCA_PATERNIDADE', 'LICENCA_ADOCAO', 'LICENCA_CASAMENTO',
  'LICENCA_NOJO', 'LTS_COMPULSORIA', 'MISSAO_ESTUDOS', 'TREINAMENTO_CURSO',
  'TRANSITO_MUDANCA', 'JURI', 'DOACAO_SANGUE', 'LIC_TRATAR_INT_PARTICULAR',
  'LIC_ACOMP_CONJUGE', 'LIC_EXERC_ATIV_PRIVADA', 'PRISAO', 'AGREGACAO', 'OUTROS'
] as const;

export const AFASTAMENTOS_SEM_EFETIVO = [
  'LIC_TRATAR_INT_PARTICULAR', 'LIC_ACOMP_CONJUGE', 'LIC_EXERC_ATIV_PRIVADA', 'PRISAO', 'AGREGACAO'
];

export const CODIGOS_RESTRICAO_VALIDOS = [
  'AU', 'BS', 'CB', 'CC', 'CI', 'DG', 'DV', 'EF', 'EM', 'EP', 'ES', 'FO', 'IS', 'LP',
  'LR', 'LS', 'MA', 'MC', 'MG', 'MP', 'OU', 'PO', 'PQ', 'PT', 'SA', 'SB', 'SE', 'SF',
  'SG', 'SH', 'SI', 'SM', 'SN', 'SP', 'ST', 'UA', 'UB', 'UC', 'US', 'UU', 'VP'
];

export const CODIGOS_CRITICOS = ['UA', 'PO', 'DV', 'SE'];

export const STATUS_VIATURA = ['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'BAIXADA'] as const;
export const STATUS_OCORRENCIA = ['REGISTRADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ARQUIVADA'] as const;
export const TIPOS_MANUTENCAO = ['PREVENTIVA', 'CORRETIVA', 'REVISAO', 'EMERGENCIAL'] as const;

// ===========================================
// CONFIGURAÇÕES DE AUTENTICAÇÃO
// ===========================================

export const JWT_SECRET = process.env.JWT_SECRET || 'sigo-dev-secret-key-change-in-production';
export const JWT_EXPIRES_IN = '8h';
export const JWT_REFRESH_EXPIRES_IN = '7d';
export const BCRYPT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;

// ===========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ===========================================

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
export const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requisições por minuto

// ===========================================
// TIPOS E INTERFACES
// ===========================================

export interface JWTPayload {
  userId: number;
  username: string;
  perfil: PerfilUsuario;
  secao: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Re-export database
export { prisma } from './database';
