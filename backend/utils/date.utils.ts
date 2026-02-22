/**
 * SIGO - Utilitários de Data
 */

import { format } from 'date-fns';

/**
 * Parse uma string de data no formato 'yyyy-MM-dd' para Date
 * Usa meio-dia para evitar problemas de timezone
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formata Date para string 'yyyy-MM-dd'
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formata Date para string 'dd/MM/yyyy' (formato brasileiro)
 */
export function formatDateBR(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}
