/**
 * SIGO - Hooks para Policiais (P/1)
 */

import { useCallback } from 'react';
import {
  policiaisApi,
  afastamentosApi,
  restricoesApi,
  subunidadesApi,
  PolicialFilters,
  PolicialCreate,
  AfastamentoCreate,
  RestricaoCreate,
} from '../services/api';
import { usePaginatedApi, useApi, useMutation, useApiAutoFetch } from './useApi';

// Hook para listar policiais
export function usePoliciais(
  initialFilters: PolicialFilters = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => policiaisApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para buscar policial por ID
export function usePolicial(id?: number) {
  const api = useApi((policialId: number) => policiaisApi.buscarPorId(policialId));

  const fetch = useCallback(
    (policialId?: number) => {
      const idToFetch = policialId ?? id;
      if (idToFetch) {
        return api.execute(idToFetch);
      }
      return Promise.resolve(null);
    },
    [api, id]
  );

  return { ...api, fetch };
}

// Hook para criar policial
export function useCreatePolicial(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, PolicialCreate>(
    (data) => policiaisApi.criar(data),
    options
  );
}

// Hook para atualizar policial
export function useUpdatePolicial(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<PolicialCreate> }>(
    ({ id, data }) => policiaisApi.atualizar(id, data),
    options
  );
}

// Hook para excluir policial
export function useDeletePolicial(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  return useMutation<void, number>(
    (id) => policiaisApi.excluir(id),
    options as any
  );
}

// Hook para listar afastamentos
export function useAfastamentos(
  initialFilters: { policialId?: number; ativo?: boolean } = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => afastamentosApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para criar afastamento
export function useCreateAfastamento(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, AfastamentoCreate>(
    (data) => afastamentosApi.criar(data),
    options
  );
}

// Hook para atualizar afastamento
export function useUpdateAfastamento(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<Omit<AfastamentoCreate, 'policialId'>> }>(
    ({ id, data }) => afastamentosApi.atualizar(id, data),
    options
  );
}

// Hook para excluir afastamento
export function useDeleteAfastamento(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  return useMutation<void, number>(
    (id) => afastamentosApi.excluir(id),
    options as any
  );
}

// Hook para listar restrições
export function useRestricoes(
  initialFilters: { policialId?: number; ativo?: boolean; critico?: boolean } = {},
  options?: { autoFetch?: boolean }
) {
  return usePaginatedApi(
    (filters) => restricoesApi.listar(filters),
    initialFilters,
    options
  );
}

// Hook para criar restrição
export function useCreateRestricao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, RestricaoCreate>(
    (data) => restricoesApi.criar(data),
    options
  );
}

// Hook para atualizar restrição
export function useUpdateRestricao(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return useMutation<any, { id: number; data: Partial<Omit<RestricaoCreate, 'policialId'>> }>(
    ({ id, data }) => restricoesApi.atualizar(id, data),
    options
  );
}

// Hook para excluir restrição
export function useDeleteRestricao(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  return useMutation<void, number>(
    (id) => restricoesApi.excluir(id),
    options as any
  );
}

// Hook para listar subunidades
export function useSubunidades() {
  return useApiAutoFetch(() => subunidadesApi.listar());
}

// Hook combinado para P/1 com todas as funcionalidades
export function useP1() {
  const policiais = usePoliciais();
  const afastamentos = useAfastamentos({ ativo: true });
  const restricoes = useRestricoes({ ativo: true });
  const subunidades = useSubunidades();

  const createPolicial = useCreatePolicial({
    onSuccess: () => policiais.refetch(),
  });

  const updatePolicial = useUpdatePolicial({
    onSuccess: () => policiais.refetch(),
  });

  const deletePolicial = useDeletePolicial({
    onSuccess: () => policiais.refetch(),
  });

  const createAfastamento = useCreateAfastamento({
    onSuccess: () => {
      afastamentos.refetch();
      policiais.refetch();
    },
  });

  const createRestricao = useCreateRestricao({
    onSuccess: () => {
      restricoes.refetch();
      policiais.refetch();
    },
  });

  return {
    policiais,
    afastamentos,
    restricoes,
    subunidades,
    createPolicial,
    updatePolicial,
    deletePolicial,
    createAfastamento,
    createRestricao,
  };
}
