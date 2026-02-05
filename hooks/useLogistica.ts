/**
 * SIGO - Hooks para Logística (P/4)
 */

import { useCallback } from 'react';
import {
  viaturasApi,
  manutencoesApi,
  materiaisApi,
  ViaturaFilters,
  ViaturaCreate,
  ManutencaoFilters,
  ManutencaoCreate,
  MaterialFilters,
} from '../services/api';
import { usePaginatedApi, useApi, useMutation, useApiAutoFetch } from './useApi';

// ===========================================
// VIATURAS
// ===========================================

// Hook para listar viaturas
export function useViaturas(
  initialFilters: ViaturaFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => viaturasApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para buscar viatura por ID
export function useViatura(id?: number) {
  const api = useApi((viaturaId: number) => viaturasApi.buscarPorId(viaturaId));

  const fetch = useCallback(
    (viaturaId?: number) => {
      const idToFetch = viaturaId ?? id;
      if (idToFetch) {
        return api.execute(idToFetch);
      }
      return Promise.resolve(null);
    },
    [api, id]
  );

  return { ...api, fetch };
}

// Hook para criar viatura
export function useCreateViatura(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, ViaturaCreate>(
    (data) => viaturasApi.criar(data),
    options
  );
}

// Hook para atualizar viatura
export function useUpdateViatura(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<ViaturaCreate> }>(
    ({ id, data }) => viaturasApi.atualizar(id, data),
    options
  );
}

// Hook para excluir viatura
export function useDeleteViatura(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  return useMutation<void, number>(
    (id) => viaturasApi.excluir(id),
    options as any
  );
}

// ===========================================
// MANUTENÇÕES
// ===========================================

// Hook para listar manutenções
export function useManutencoes(
  initialFilters: ManutencaoFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => manutencoesApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para criar manutenção
export function useCreateManutencao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, ManutencaoCreate>(
    (data) => manutencoesApi.criar(data),
    options
  );
}

// Hook para atualizar manutenção
export function useUpdateManutencao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<Omit<ManutencaoCreate, 'viaturaId'>> }>(
    ({ id, data }) => manutencoesApi.atualizar(id, data),
    options
  );
}

// ===========================================
// MATERIAIS
// ===========================================

// Hook para listar materiais
export function useMateriais(
  initialFilters: MaterialFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => materiaisApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook combinado para P/4 com todas as funcionalidades
export function useP4() {
  const viaturas = useViaturas();
  const manutencoes = useManutencoes();
  const materiais = useMateriais();

  const createViatura = useCreateViatura({
    onSuccess: () => viaturas.refetch(),
  });

  const updateViatura = useUpdateViatura({
    onSuccess: () => viaturas.refetch(),
  });

  const deleteViatura = useDeleteViatura({
    onSuccess: () => viaturas.refetch(),
  });

  const createManutencao = useCreateManutencao({
    onSuccess: () => {
      manutencoes.refetch();
      viaturas.refetch();
    },
  });

  const updateManutencao = useUpdateManutencao({
    onSuccess: () => {
      manutencoes.refetch();
      viaturas.refetch();
    },
  });

  return {
    viaturas,
    manutencoes,
    materiais,
    createViatura,
    updateViatura,
    deleteViatura,
    createManutencao,
    updateManutencao,
  };
}
