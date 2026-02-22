/**
 * SIGO - Serviços de Regras de Negócio
 */

import { prisma } from '../config/database';
import { CODIGOS_RESTRICAO_VALIDOS, CODIGOS_CRITICOS } from '../config';

/**
 * Aplica regras de restrição conforme BG PM 232/08
 * - Valida códigos
 * - SE implica em UU (regra automática)
 * - Identifica códigos críticos
 */
export function aplicarRegrasRestricao(codigos: string[]): { finalCodigos: string[], warnings: string[] } {
  let finalCodigos = [...new Set(codigos.map(c => c.toUpperCase().trim()))];
  const warnings: string[] = [];

  // Validar códigos
  const codigosInvalidos = finalCodigos.filter(c => !CODIGOS_RESTRICAO_VALIDOS.includes(c));
  if (codigosInvalidos.length > 0) {
    throw new Error(`Códigos de restrição inválidos: ${codigosInvalidos.join(', ')}`);
  }

  // Regra BG PM 232/08: SE implica em UU
  if (finalCodigos.includes('SE') && !finalCodigos.includes('UU')) {
    finalCodigos.push('UU');
    warnings.push('Código UU adicionado automaticamente conforme BG PM 232/08 (SE implica em UU)');
  }

  // Identificar códigos críticos
  const criticos = finalCodigos.filter(c => CODIGOS_CRITICOS.includes(c));
  if (criticos.length > 0) {
    warnings.push(`ATENÇÃO: Códigos críticos presentes: ${criticos.join(', ')}. Impactam severamente o emprego operacional.`);
  }

  return { finalCodigos: finalCodigos.sort(), warnings };
}

/**
 * Verifica sobreposição de afastamentos para um policial
 * Retorna o afastamento conflitante ou null
 */
export async function verificarSobreposicaoAfastamento(
  policialId: number,
  dataInicio: Date,
  dataFim: Date | null,
  indeterminado: boolean,
  excludeId?: number
): Promise<any | null> {
  const afastamentos = await prisma.afastamento.findMany({
    where: {
      policialId,
      excluido: false,
      ...(excludeId ? { id: { not: excludeId } } : {})
    }
  });

  for (const a of afastamentos) {
    const aStart = a.dataInicio;
    const aEnd = a.dataFim;
    const aIndet = a.indeterminado;

    let overlap = false;

    if (!indeterminado && dataFim && !aIndet && aEnd) {
      overlap = !(dataInicio > aEnd || aStart > dataFim);
    } else if (indeterminado || !dataFim) {
      overlap = !aEnd || aEnd >= dataInicio;
    } else if (aIndet || !aEnd) {
      overlap = !dataFim || dataFim >= aStart;
    }

    if (overlap) {
      return a;
    }
  }

  return null;
}

/**
 * Calcula o status operacional de um policial
 * baseado em afastamentos e restrições ativas
 */
export function calcularStatusOperacional(policial: any): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Verificar afastamentos ativos
  const afastamentoAtivo = policial.afastamentos?.find((a: any) => {
    if (a.excluido) return false;
    const inicio = new Date(a.dataInicio);
    const fim = a.dataFim ? new Date(a.dataFim) : null;
    return inicio <= hoje && (!fim || fim >= hoje || a.indeterminado);
  });

  if (afastamentoAtivo) return 'AFASTADO';

  // Verificar restrições ativas
  const restricaoAtiva = policial.restricoes?.find((r: any) => {
    if (r.excluido) return false;
    const inicio = new Date(r.dataInicio);
    const fim = new Date(r.dataFim);
    return inicio <= hoje && fim >= hoje;
  });

  if (restricaoAtiva) return 'APTO_COM_RESTRICAO';

  return 'APTO';
}
