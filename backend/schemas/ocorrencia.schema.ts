/**
 * SIGO - Schemas de Validação - Ocorrência
 */

import { z } from 'zod';
import { STATUS_OCORRENCIA } from '../config';

export const OcorrenciaCreateSchema = z.object({
  numero: z.string().min(1).max(30),
  tipoId: z.number().int().positive(),
  dataHora: z.string(),
  local: z.string().min(1).max(200),
  municipio: z.string().min(1).max(100),
  coordenadas: z.string().max(50).optional(),
  descricao: z.string().min(1),
  status: z.enum(STATUS_OCORRENCIA).default('REGISTRADA'),
  policialResponsavelId: z.number().int().positive().optional(),
  viaturaId: z.number().int().positive().optional(),
  autoInfracao: z.string().max(50).optional(),
  valorMulta: z.number().optional(),
  areaPatrulhadaKm: z.number().optional(),
  observacao: z.string().optional(),
});

export const OcorrenciaUpdateSchema = OcorrenciaCreateSchema.partial();

export type OcorrenciaCreate = z.infer<typeof OcorrenciaCreateSchema>;
export type OcorrenciaUpdate = z.infer<typeof OcorrenciaUpdateSchema>;
