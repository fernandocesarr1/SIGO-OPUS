/**
 * SIGO - Schemas de Validação - Viatura
 */

import { z } from 'zod';
import { STATUS_VIATURA, TIPOS_MANUTENCAO } from '../config';

export const ViaturaCreateSchema = z.object({
  prefixo: z.string().min(1).max(20),
  placa: z.string().min(7).max(10),
  modelo: z.string().min(1).max(50),
  marca: z.string().max(50).optional(),
  ano: z.number().int().min(1990).max(2030).optional(),
  cor: z.string().max(30).optional(),
  chassi: z.string().max(50).optional(),
  renavam: z.string().max(20).optional(),
  kmAtual: z.number().int().min(0).default(0),
  kmProxRevisao: z.number().int().min(0).optional(),
  status: z.enum(STATUS_VIATURA).default('DISPONIVEL'),
  observacao: z.string().optional(),
});

export const ViaturaUpdateSchema = ViaturaCreateSchema.partial();

export const ManutencaoCreateSchema = z.object({
  viaturaId: z.number().int().positive(),
  tipo: z.enum(TIPOS_MANUTENCAO),
  descricao: z.string().min(1),
  dataEntrada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataSaida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  kmEntrada: z.number().int().min(0),
  kmSaida: z.number().int().min(0).optional(),
  custo: z.number().min(0).optional(),
  oficina: z.string().max(100).optional(),
  notaFiscal: z.string().max(50).optional(),
  concluida: z.boolean().default(false),
  observacao: z.string().optional(),
});

export const ManutencaoUpdateSchema = ManutencaoCreateSchema.partial().omit({ viaturaId: true });

export type ViaturaCreate = z.infer<typeof ViaturaCreateSchema>;
export type ViaturaUpdate = z.infer<typeof ViaturaUpdateSchema>;
export type ManutencaoCreate = z.infer<typeof ManutencaoCreateSchema>;
export type ManutencaoUpdate = z.infer<typeof ManutencaoUpdateSchema>;
