/**
 * SIGO - Hooks para Operações (P/3)
 */

import { useCallback } from 'react';
import {
  ocorrenciasApi,
  operacoesApi,
  OcorrenciaFilters,
  OcorrenciaCreate,
  OperacaoFilters,
  OperacaoCreate,
} from '../services/api';
import { usePaginatedApi, useApi, useMutation, useApiAutoFetch } from './useApi';

// ===========================================
// OCORRÊNCIAS
// ===========================================

// Hook para listar ocorrências
export function useOcorrencias(
  initialFilters: OcorrenciaFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => ocorrenciasApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para buscar ocorrência por ID
export function useOcorrencia(id?: number) {
  const api = useApi((ocorrenciaId: number) => ocorrenciasApi.buscarPorId(ocorrenciaId));

  const fetch = useCallback(
    (ocorrenciaId?: number) => {
      const idToFetch = ocorrenciaId ?? id;
      if (idToFetch) {
        return api.execute(idToFetch);
      }
      return Promise.resolve(null);
    },
    [api, id]
  );

  return { ...api, fetch };
}

// Hook para criar ocorrência
export function useCreateOcorrencia(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, OcorrenciaCreate>(
    (data) => ocorrenciasApi.criar(data),
    options
  );
}

// Hook para atualizar ocorrência
export function useUpdateOcorrencia(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<OcorrenciaCreate> }>(
    ({ id, data }) => ocorrenciasApi.atualizar(id, data),
    options
  );
}

// Hook para excluir ocorrência
export function useDeleteOcorrencia(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  return useMutation<void, number>(
    (id) => ocorrenciasApi.excluir(id),
    options as any
  );
}

// Hook para listar tipos de ocorrência
export function useTiposOcorrencia() {
  return useApiAutoFetch(() => ocorrenciasApi.listarTipos());
}

// ===========================================
// OPERAÇÕES
// ===========================================

// Hook para listar operações
export function useOperacoesList(
  initialFilters: OperacaoFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => operacoesApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para criar operação
export function useCreateOperacao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, OperacaoCreate>(
    (data) => operacoesApi.criar(data),
    options
  );
}

// Hook para atualizar operação
export function useUpdateOperacao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<OperacaoCreate> }>(
    ({ id, data }) => operacoesApi.atualizar(id, data),
    options
  );
}

// Hook combinado para P/3 com todas as funcionalidades
export function useP3() {
  const ocorrencias = useOcorrencias();
  const operacoes = useOperacoesList({ ativa: true });
  const tiposOcorrencia = useTiposOcorrencia();

  const createOcorrencia = useCreateOcorrencia({
    onSuccess: () => ocorrencias.refetch(),
  });

  const updateOcorrencia = useUpdateOcorrencia({
    onSuccess: () => ocorrencias.refetch(),
  });

  const deleteOcorrencia = useDeleteOcorrencia({
    onSuccess: () => ocorrencias.refetch(),
  });

  const createOperacao = useCreateOperacao({
    onSuccess: () => operacoes.refetch(),
  });

  const updateOperacao = useUpdateOperacao({
    onSuccess: () => operacoes.refetch(),
  });

  return {
    ocorrencias,
    operacoes,
    tiposOcorrencia,
    createOcorrencia,
    updateOcorrencia,
    deleteOcorrencia,
    createOperacao,
    updateOperacao,
  };
}
