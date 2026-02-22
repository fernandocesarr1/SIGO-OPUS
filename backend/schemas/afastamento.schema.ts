/**
 * SIGO - Schemas de Validação - Afastamento
 */

import { z } from 'zod';
import { TIPOS_AFASTAMENTO } from '../config';

export const AfastamentoCreateSchema = z.object({
  policialId: z.number().int().positive(),
  tipo: z.enum(TIPOS_AFASTAMENTO),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  indeterminado: z.boolean().default(false),
  documento: z.string().max(100).optional(),
  observacao: z.string().optional(),
});

export const AfastamentoUpdateSchema = AfastamentoCreateSchema.partial().omit({ policialId: true });

export type AfastamentoCreate = z.infer<typeof AfastamentoCreateSchema>;
export type AfastamentoUpdate = z.infer<typeof AfastamentoUpdateSchema>;
