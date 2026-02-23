/**
 * SIGO - Testes do hook useApi
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useMutation, useApiAutoFetch } from '../../hooks/useApi';
import type { ApiResponse } from '../../services/api';

// Mock simples do ApiResponse
const mockSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

const mockErrorResponse = (error: string): ApiResponse<never> => ({
  success: false,
  error,
});

describe('useApi', () => {
  it('estado inicial deve estar correto', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useApi(mockFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve executar função e atualizar estado com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));

    const { result } = renderHook(() => useApi(mockFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('deve tratar erro da API', async () => {
    const mockFn = vi.fn().mockResolvedValue(mockErrorResponse('API Error'));

    const { result } = renderHook(() => useApi(mockFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('API Error');
    expect(result.current.loading).toBe(false);
  });

  it('deve tratar exceção de rede', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi(mockFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Erro de conexão com o servidor');
    expect(result.current.loading).toBe(false);
  });

  it('deve chamar onSuccess callback quando sucesso', async () => {
    const mockData = { id: 1 };
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApi(mockFn, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('deve chamar onError callback quando erro', async () => {
    const mockFn = vi.fn().mockResolvedValue(mockErrorResponse('Test error'));
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useApi(mockFn, { onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith('Test error');
  });

  it('reset deve limpar estado', async () => {
    const mockData = { id: 1 };
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));

    const { result } = renderHook(() => useApi(mockFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('setData deve atualizar dados manualmente', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useApi(mockFn));

    act(() => {
      result.current.setData({ custom: 'data' });
    });

    expect(result.current.data).toEqual({ custom: 'data' });
  });
});

describe('useMutation', () => {
  it('estado inicial deve estar correto', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useMutation(mockFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve executar mutation com sucesso', async () => {
    const mockData = { id: 1, created: true };
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));

    const { result } = renderHook(() => useMutation(mockFn));

    await act(async () => {
      await result.current.mutate({ name: 'test' });
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(mockFn).toHaveBeenCalledWith({ name: 'test' });
  });

  it('deve tratar erro na mutation', async () => {
    const mockFn = vi.fn().mockResolvedValue(mockErrorResponse('Mutation failed'));

    const { result } = renderHook(() => useMutation(mockFn));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(result.current.error).toBe('Mutation failed');
    expect(result.current.data).toBeNull();
  });
});

describe('useApiAutoFetch', () => {
  it('deve fazer fetch automaticamente no mount', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));

    const { result } = renderHook(() => useApiAutoFetch(mockFn));

    // Aguardar fetch automático
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('deve respeitar enabled=false', async () => {
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse([]));

    renderHook(() => useApiAutoFetch(mockFn, [], { enabled: false }));

    // Aguardar um pouco para garantir que não foi chamado
    await new Promise((r) => setTimeout(r, 100));

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('refetch deve funcionar', async () => {
    const mockData = [{ id: 1 }];
    const mockFn = vi.fn().mockResolvedValue(mockSuccessResponse(mockData));

    const { result } = renderHook(() => useApiAutoFetch(mockFn));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
