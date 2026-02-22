/**
 * SIGO - Schemas de Validação - Operação
 */

import { z } from 'zod';

export const OperacaoCreateSchema = z.object({
  nome: z.string().min(1).max(150),
  descricao: z.string().optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  localidade: z.string().min(1).max(200),
  objetivo: z.string().min(1),
  efetivoPrevisto: z.number().int().min(0).default(0),
  efetivoReal: z.number().int().min(0).default(0),
  viaturasUtilizadas: z.number().int().min(0).default(0),
  resultados: z.string().optional(),
});

export const OperacaoUpdateSchema = OperacaoCreateSchema.partial();

export type OperacaoCreate = z.infer<typeof OperacaoCreateSchema>;
export type OperacaoUpdate = z.infer<typeof OperacaoUpdateSchema>;
