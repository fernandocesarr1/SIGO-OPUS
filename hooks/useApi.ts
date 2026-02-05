/**
 * SIGO - Hook genérico para chamadas à API
 * Gerencia estado de loading, erro e dados
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiResponse, ApiError } from '../services/api';

// Estado do hook
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Retorno do hook
export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

// Hook para chamadas únicas (fetch manual)
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);

        if (!mountedRef.current) return null;

        if (response.success && response.data !== undefined) {
          setState({ data: response.data, loading: false, error: null });
          options?.onSuccess?.(response.data);
          return response.data;
        } else {
          const errorMsg = response.error || 'Erro desconhecido';
          setState({ data: null, loading: false, error: errorMsg });
          options?.onError?.(errorMsg);
          return null;
        }
      } catch (error) {
        if (!mountedRef.current) return null;

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Erro de conexão com o servidor';

        setState({ data: null, loading: false, error: errorMsg });
        options?.onError?.(errorMsg);
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, execute, reset, setData };
}

// Hook para chamadas automáticas (fetch on mount)
export function useApiAutoFetch<T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T> & { refetch: () => Promise<T | null> } {
  const { enabled = true } = options || {};
  const api = useApi(apiFunction, options);

  useEffect(() => {
    if (enabled) {
      api.execute();
    }
  }, [...dependencies, enabled]);

  return { ...api, refetch: api.execute };
}

// Hook para listagem com filtros e paginação
export interface UsePaginatedApiReturn<T> extends UseApiState<T[]> {
  execute: (filters?: any) => Promise<T[] | null>;
  refetch: () => Promise<T[] | null>;
  reset: () => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  setPage: (page: number) => void;
  filters: any;
  setFilters: (filters: any) => void;
}

export function usePaginatedApi<T>(
  apiFunction: (filters: any) => Promise<ApiResponse<T[]>>,
  initialFilters: any = {},
  options?: {
    autoFetch?: boolean;
    onSuccess?: (data: T[]) => void;
    onError?: (error: string) => void;
  }
): UsePaginatedApiReturn<T> {
  const [state, setState] = useState<UseApiState<T[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [filters, setFilters] = useState(initialFilters);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (customFilters?: any): Promise<T[] | null> => {
      const currentFilters = customFilters || filters;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(currentFilters);

        if (!mountedRef.current) return null;

        if (response.success && response.data !== undefined) {
          setState({ data: response.data, loading: false, error: null });

          if (response.pagination) {
            setPagination(response.pagination);
          }

          options?.onSuccess?.(response.data);
          return response.data;
        } else {
          const errorMsg = response.error || 'Erro desconhecido';
          setState({ data: null, loading: false, error: errorMsg });
          options?.onError?.(errorMsg);
          return null;
        }
      } catch (error) {
        if (!mountedRef.current) return null;

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Erro de conexão com o servidor';

        setState({ data: null, loading: false, error: errorMsg });
        options?.onError?.(errorMsg);
        return null;
      }
    },
    [apiFunction, filters, options]
  );

  const refetch = useCallback(() => execute(filters), [execute, filters]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    setPagination(null);
  }, []);

  const setPage = useCallback(
    (page: number) => {
      const newFilters = { ...filters, page };
      setFilters(newFilters);
      execute(newFilters);
    },
    [filters, execute]
  );

  const updateFilters = useCallback(
    (newFilters: any) => {
      const mergedFilters = { ...newFilters, page: 1 };
      setFilters(mergedFilters);
      if (options?.autoFetch !== false) {
        execute(mergedFilters);
      }
    },
    [execute, options?.autoFetch]
  );

  // Auto fetch inicial
  useEffect(() => {
    if (options?.autoFetch !== false) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    refetch,
    reset,
    pagination,
    setPage,
    filters,
    setFilters: updateFilters,
  };
}

// Hook para mutations (POST, PUT, DELETE)
export interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  loading: boolean;
  error: string | null;
  data: TData | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFunction: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
  }
): UseMutationReturn<TData, TVariables> {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await mutationFunction(variables);

        if (!mountedRef.current) return null;

        if (response.success && response.data !== undefined) {
          setState({ data: response.data, loading: false, error: null });
          options?.onSuccess?.(response.data);
          return response.data;
        } else {
          const errorMsg = response.error || 'Erro ao executar operação';
          setState({ data: null, loading: false, error: errorMsg });
          options?.onError?.(errorMsg);
          return null;
        }
      } catch (error) {
        if (!mountedRef.current) return null;

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Erro de conexão com o servidor';

        setState({ data: null, loading: false, error: errorMsg });
        options?.onError?.(errorMsg);
        return null;
      }
    },
    [mutationFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}

export default useApi;
