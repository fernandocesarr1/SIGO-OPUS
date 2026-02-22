/**
 * SIGO - Schemas de Validação - Restrição
 */

import { z } from 'zod';

export const RestricaoCreateSchema = z.object({
  policialId: z.number().int().positive(),
  codigos: z.array(z.string().max(5)).min(1).max(20),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documento: z.string().min(1).max(100),
  parecerMedico: z.string().optional(),
  observacao: z.string().optional(),
});

export const RestricaoUpdateSchema = RestricaoCreateSchema.partial().omit({ policialId: true });

export type RestricaoCreate = z.infer<typeof RestricaoCreateSchema>;
export type RestricaoUpdate = z.infer<typeof RestricaoUpdateSchema>;
