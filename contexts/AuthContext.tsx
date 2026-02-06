/**
 * SIGO - Contexto de Autenticação
 * Gerencia estado de autenticação JWT
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

// Tipos
export type PerfilUsuario = 'COMANDANTE' | 'CHEFE_SECAO' | 'OPERADOR' | 'ADMIN_SISTEMA';

interface Policial {
  id: number;
  re?: string;
  nome: string;
  nomeGuerra: string;
  posto: string;
  funcao?: string;
  subunidade?: {
    id: number;
    nome: string;
    sigla: string;
  };
}

interface Usuario {
  id: number;
  username: string;
  perfil: PerfilUsuario;
  secao: string | null;
  policial?: Policial | null;
  ultimoAcesso?: string;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  username: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

interface AuthContextData extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasPermissao: (perfisPermitidos: PerfilUsuario[]) => boolean;
  hasSecao: (secoesPermitidas: string[]) => boolean;
}

// Storage keys
const TOKEN_KEY = '@sigo:token';
const USER_KEY = '@sigo:usuario';

// Context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    token: null,
    usuario: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Carregar dados salvos no localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const usuarioStr = localStorage.getItem(USER_KEY);

    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setState({
          token,
          usuario,
          isAuthenticated: true,
          isLoading: false,
        });
        // Configurar token no header padrão
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        // Dados inválidos, limpar
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Verificar se token ainda é válido
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({
        token: null,
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/check');

      if (response.data.success && response.data.data.valid) {
        return true;
      }

      // Token inválido
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];
      setState({
        token: null,
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    } catch {
      // Erro na verificação - considerar token inválido
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];
      setState({
        token: null,
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }
  }, []);

  // Login
  const login = useCallback(async ({ username, senha }: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post<{ success: boolean; data: LoginResponse; error?: string }>('/api/auth/login', {
        username,
        senha,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao fazer login');
      }

      const { token, usuario } = response.data.data;

      // Salvar no localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));

      // Configurar header de autorização
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setState({
        token,
        usuario,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));

      // Re-throw com mensagem amigável
      const message = error.response?.data?.error || error.message || 'Erro ao fazer login';
      throw new Error(message);
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Tentar fazer logout no servidor (invalidar sessão)
      if (state.token) {
        await api.post('/api/auth/logout').catch(() => {
          // Ignorar erros no logout do servidor
        });
      }
    } finally {
      // Limpar estado local
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];

      setState({
        token: null,
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [state.token]);

  // Verificar se usuário tem perfil permitido
  const hasPermissao = useCallback((perfisPermitidos: PerfilUsuario[]): boolean => {
    if (!state.usuario) return false;
    return perfisPermitidos.includes(state.usuario.perfil);
  }, [state.usuario]);

  // Verificar se usuário tem acesso à seção
  const hasSecao = useCallback((secoesPermitidas: string[]): boolean => {
    if (!state.usuario) return false;

    // Admin e Comandante têm acesso a todas as seções
    if (state.usuario.perfil === 'ADMIN_SISTEMA' || state.usuario.perfil === 'COMANDANTE') {
      return true;
    }

    // Chefe de seção só acessa sua seção
    if (state.usuario.perfil === 'CHEFE_SECAO') {
      return state.usuario.secao ? secoesPermitidas.includes(state.usuario.secao) : false;
    }

    // Operador pode acessar seções gerais
    return true;
  }, [state.usuario]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAuth,
        hasPermissao,
        hasSecao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

// Componente de proteção de rota
interface ProtectedRouteProps {
  children: ReactNode;
  perfisPermitidos?: PerfilUsuario[];
  secoesPermitidas?: string[];
}

export function ProtectedRoute({
  children,
  perfisPermitidos,
  secoesPermitidas
}: ProtectedRouteProps): JSX.Element | null {
  const { isAuthenticated, isLoading, hasPermissao, hasSecao } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para login será tratado no App.tsx
    return null;
  }

  // Verificar permissões de perfil
  if (perfisPermitidos && !hasPermissao(perfisPermitidos)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">&#9888;</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Seu perfil não tem permissão para acessar esta pagina.</p>
        </div>
      </div>
    );
  }

  // Verificar permissões de seção
  if (secoesPermitidas && !hasSecao(secoesPermitidas)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-yellow-500 text-5xl mb-4">&#9888;</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Voce nao tem permissao para acessar esta secao.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthContext;
