/**
 * SIGO - Schemas de Validação - Autenticação
 */

import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const AlterarSenhaSchema = z.object({
  senhaAtual: z.string().min(6),
  novaSenha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

export type LoginData = z.infer<typeof LoginSchema>;
export type AlterarSenhaData = z.infer<typeof AlterarSenhaSchema>;
