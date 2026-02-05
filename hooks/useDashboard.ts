/**
 * SIGO - Hooks para Dashboard
 */

import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../services/api';
import { useApiAutoFetch, useApi } from './useApi';

// Interface para dados do dashboard
export interface DashboardData {
  efetivo: {
    total: number;
    aptos: number;
    comRestricao: number;
    afastados: number;
    porPosto: Array<{ posto: string; postoLabel: string; quantidade: number }>;
  } | null;
  vencimentos: {
    afastamentos: Array<{
      id: number;
      militar: string;
      tipo: string;
      vencimento: string;
      diasRestantes: number;
    }>;
    restricoes: Array<{
      id: number;
      militar: string;
      codigos: string[];
      vencimento: string;
      diasRestantes: number;
      critico: boolean;
    }>;
  } | null;
  alertas: {
    restricoesCriticas: Array<{
      id: number;
      militar: string;
      re: string;
      codigos: string[];
      vencimento: string;
    }>;
    viaturasManutencao: Array<{
      id: number;
      prefixo: string;
      modelo: string;
    }>;
    afastamentosVencendo: number;
    materiaisAlerta: number;
    totalAlertas: number;
  } | null;
  ocorrencias: {
    total: number;
    autosInfracao: number;
    areaPatrulhadaKm: number;
    porStatus: Array<{ status: string; quantidade: number }>;
    porTipo: Array<{ tipo: string; quantidade: number }>;
  } | null;
  viaturas: {
    total: number;
    disponiveis: number;
    emUso: number;
    manutencao: number;
    baixadas: number;
    taxaDisponibilidade: number;
  } | null;
}

// Hook para dados do efetivo
export function useDashboardEfetivo() {
  return useApiAutoFetch(() => dashboardApi.efetivo());
}

// Hook para vencimentos
export function useDashboardVencimentos(dias: number = 7) {
  return useApiAutoFetch(() => dashboardApi.vencimentos(dias), [dias]);
}

// Hook para alertas
export function useDashboardAlertas() {
  return useApiAutoFetch(() => dashboardApi.alertas());
}

// Hook para estatísticas de ocorrências
export function useDashboardOcorrencias(periodo: number = 30) {
  return useApiAutoFetch(() => dashboardApi.ocorrencias(periodo), [periodo]);
}

// Hook para estatísticas de viaturas
export function useDashboardViaturas() {
  return useApiAutoFetch(() => dashboardApi.viaturas());
}

// Hook combinado para todo o dashboard
export function useDashboard() {
  const efetivo = useDashboardEfetivo();
  const vencimentos = useDashboardVencimentos();
  const alertas = useDashboardAlertas();
  const ocorrencias = useDashboardOcorrencias();
  const viaturas = useDashboardViaturas();

  const loading =
    efetivo.loading ||
    vencimentos.loading ||
    alertas.loading ||
    ocorrencias.loading ||
    viaturas.loading;

  const error =
    efetivo.error ||
    vencimentos.error ||
    alertas.error ||
    ocorrencias.error ||
    viaturas.error;

  const refetchAll = useCallback(() => {
    efetivo.refetch();
    vencimentos.refetch();
    alertas.refetch();
    ocorrencias.refetch();
    viaturas.refetch();
  }, [efetivo, vencimentos, alertas, ocorrencias, viaturas]);

  // Dados combinados para os cards do dashboard
  const stats = {
    efetivoAtivo: efetivo.data?.total ?? 0,
    efetivoAptos: efetivo.data?.aptos ?? 0,
    efetivoComRestricao: efetivo.data?.comRestricao ?? 0,
    efetivoAfastados: efetivo.data?.afastados ?? 0,
    totalOcorrencias: ocorrencias.data?.total ?? 0,
    autosInfracao: ocorrencias.data?.autosInfracao ?? 0,
    areaPatrulhada: ocorrencias.data?.areaPatrulhadaKm ?? 0,
    viaturasDisponiveis: viaturas.data?.disponiveis ?? 0,
    viaturasTotal: viaturas.data?.total ?? 0,
    viaturasManutencao: viaturas.data?.manutencao ?? 0,
    totalAlertas: alertas.data?.totalAlertas ?? 0,
  };

  return {
    efetivo,
    vencimentos,
    alertas,
    ocorrencias,
    viaturas,
    stats,
    loading,
    error,
    refetchAll,
  };
}

export default useDashboard;
