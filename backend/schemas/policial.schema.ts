/**
 * SIGO - Schemas de Validação - Policial
 */

import { z } from 'zod';
import { POSTOS } from '../config';

export const PolicialCreateSchema = z.object({
  re: z.string().min(1).max(20),
  digito: z.string().max(2).optional(),
  nome: z.string().min(3).max(200),
  nomeGuerra: z.string().min(2).max(100),
  posto: z.enum(POSTOS),
  funcao: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().max(20).optional(),
  subunidadeId: z.number().optional(),
  dataInclusao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const PolicialUpdateSchema = PolicialCreateSchema.partial();

export type PolicialCreate = z.infer<typeof PolicialCreateSchema>;
export type PolicialUpdate = z.infer<typeof PolicialUpdateSchema>;
