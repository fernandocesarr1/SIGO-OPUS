/**
 * SIGO - Cliente HTTP para comunicação com a API
 * Serviço centralizado para todas as chamadas ao backend
 */

// URL base da API - usa proxy em desenvolvimento
const API_BASE_URL = '/api';

// Interface para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  warnings?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Classe de erro personalizada para erros da API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Opções para requisições
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

// Função para construir query string
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';

  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

// Função principal de requisição
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params, headers = {} } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Usuario': 'Sistema Web', // Identificação do usuário (será substituído por auth)
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Erro na requisição',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Erro de rede ou outro erro
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro de conexão com o servidor',
      0
    );
  }
}

// ===========================================
// ENDPOINTS - POLICIAIS (P/1)
// ===========================================

export interface PolicialFilters {
  page?: number;
  limit?: number;
  busca?: string;
  posto?: string;
  subunidadeId?: number;
  status?: string;
  ativo?: boolean;
}

export interface PolicialCreate {
  re: string;
  digito?: string;
  nome: string;
  nomeGuerra: string;
  posto: string;
  funcao?: string;
  email?: string;
  telefone?: string;
  subunidadeId?: number;
  dataInclusao?: string;
  dataNascimento?: string;
}

export const policiaisApi = {
  listar: (filters?: PolicialFilters) =>
    request<any[]>('/policiais', { params: filters as any }),

  buscarPorId: (id: number) =>
    request<any>(`/policiais/${id}`),

  criar: (data: PolicialCreate) =>
    request<any>('/policiais', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<PolicialCreate>) =>
    request<any>(`/policiais/${id}`, { method: 'PUT', body: data }),

  excluir: (id: number) =>
    request<void>(`/policiais/${id}`, { method: 'DELETE' }),
};

// ===========================================
// ENDPOINTS - AFASTAMENTOS (P/1)
// ===========================================

export interface AfastamentoFilters {
  page?: number;
  limit?: number;
  policialId?: number;
  tipo?: string;
  ativo?: boolean;
}

export interface AfastamentoCreate {
  policialId: number;
  tipo: string;
  dataInicio: string;
  dataFim?: string;
  indeterminado?: boolean;
  documento?: string;
  observacao?: string;
}

export const afastamentosApi = {
  listar: (filters?: AfastamentoFilters) =>
    request<any[]>('/afastamentos', { params: filters as any }),

  buscarPorId: (id: number) =>
    request<any>(`/afastamentos/${id}`),

  criar: (data: AfastamentoCreate) =>
    request<any>('/afastamentos', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<Omit<AfastamentoCreate, 'policialId'>>) =>
    request<any>(`/afastamentos/${id}`, { method: 'PUT', body: data }),

  excluir: (id: number) =>
    request<void>(`/afastamentos/${id}`, { method: 'DELETE' }),
};

// ===========================================
// ENDPOINTS - RESTRIÇÕES (P/1)
// ===========================================

export interface RestricaoFilters {
  page?: number;
  limit?: number;
  policialId?: number;
  ativo?: boolean;
  critico?: boolean;
}

export interface RestricaoCreate {
  policialId: number;
  codigos: string[];
  dataInicio: string;
  dataFim: string;
  documento: string;
  parecerMedico?: string;
  observacao?: string;
}

export const restricoesApi = {
  listar: (filters?: RestricaoFilters) =>
    request<any[]>('/restricoes', { params: filters as any }),

  buscarPorId: (id: number) =>
    request<any>(`/restricoes/${id}`),

  criar: (data: RestricaoCreate) =>
    request<any>('/restricoes', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<Omit<RestricaoCreate, 'policialId'>>) =>
    request<any>(`/restricoes/${id}`, { method: 'PUT', body: data }),

  excluir: (id: number) =>
    request<void>(`/restricoes/${id}`, { method: 'DELETE' }),
};

// ===========================================
// ENDPOINTS - OCORRÊNCIAS (P/3)
// ===========================================

export interface OcorrenciaFilters {
  page?: number;
  limit?: number;
  tipoId?: number;
  status?: string;
  municipio?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface OcorrenciaCreate {
  numero: string;
  tipoId: number;
  dataHora: string;
  local: string;
  municipio: string;
  coordenadas?: string;
  descricao: string;
  status?: string;
  policialResponsavelId?: number;
  viaturaId?: number;
  autoInfracao?: string;
  valorMulta?: number;
  areaPatrulhadaKm?: number;
  observacao?: string;
}

export const ocorrenciasApi = {
  listar: (filters?: OcorrenciaFilters) =>
    request<any[]>('/ocorrencias', { params: filters as any }),

  buscarPorId: (id: number) =>
    request<any>(`/ocorrencias/${id}`),

  criar: (data: OcorrenciaCreate) =>
    request<any>('/ocorrencias', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<OcorrenciaCreate>) =>
    request<any>(`/ocorrencias/${id}`, { method: 'PUT', body: data }),

  excluir: (id: number) =>
    request<void>(`/ocorrencias/${id}`, { method: 'DELETE' }),

  listarTipos: () =>
    request<any[]>('/tipos-ocorrencia'),
};

// ===========================================
// ENDPOINTS - OPERAÇÕES (P/3)
// ===========================================

export interface OperacaoFilters {
  page?: number;
  limit?: number;
  ativa?: boolean;
}

export interface OperacaoCreate {
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  localidade: string;
  objetivo: string;
  efetivoPrevisto?: number;
  efetivoReal?: number;
  viaturasUtilizadas?: number;
  resultados?: string;
}

export const operacoesApi = {
  listar: (filters?: OperacaoFilters) =>
    request<any[]>('/operacoes', { params: filters as any }),

  criar: (data: OperacaoCreate) =>
    request<any>('/operacoes', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<OperacaoCreate>) =>
    request<any>(`/operacoes/${id}`, { method: 'PUT', body: data }),
};

// ===========================================
// ENDPOINTS - VIATURAS (P/4)
// ===========================================

export interface ViaturaFilters {
  page?: number;
  limit?: number;
  status?: string;
  ativo?: boolean;
}

export interface ViaturaCreate {
  prefixo: string;
  placa: string;
  modelo: string;
  marca?: string;
  ano?: number;
  cor?: string;
  chassi?: string;
  renavam?: string;
  kmAtual?: number;
  kmProxRevisao?: number;
  status?: string;
  observacao?: string;
}

export const viaturasApi = {
  listar: (filters?: ViaturaFilters) =>
    request<any[]>('/viaturas', { params: filters as any }),

  buscarPorId: (id: number) =>
    request<any>(`/viaturas/${id}`),

  criar: (data: ViaturaCreate) =>
    request<any>('/viaturas', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<ViaturaCreate>) =>
    request<any>(`/viaturas/${id}`, { method: 'PUT', body: data }),

  excluir: (id: number) =>
    request<void>(`/viaturas/${id}`, { method: 'DELETE' }),
};

// ===========================================
// ENDPOINTS - MANUTENÇÕES (P/4)
// ===========================================

export interface ManutencaoFilters {
  page?: number;
  limit?: number;
  viaturaId?: number;
  concluida?: boolean;
}

export interface ManutencaoCreate {
  viaturaId: number;
  tipo: string;
  descricao: string;
  dataEntrada: string;
  dataSaida?: string;
  kmEntrada: number;
  kmSaida?: number;
  custo?: number;
  oficina?: string;
  notaFiscal?: string;
  concluida?: boolean;
  observacao?: string;
}

export const manutencoesApi = {
  listar: (filters?: ManutencaoFilters) =>
    request<any[]>('/manutencoes', { params: filters as any }),

  criar: (data: ManutencaoCreate) =>
    request<any>('/manutencoes', { method: 'POST', body: data }),

  atualizar: (id: number, data: Partial<Omit<ManutencaoCreate, 'viaturaId'>>) =>
    request<any>(`/manutencoes/${id}`, { method: 'PUT', body: data }),
};

// ===========================================
// ENDPOINTS - MATERIAIS (P/4)
// ===========================================

export interface MaterialFilters {
  page?: number;
  limit?: number;
  categoria?: string;
  estoqueMinimo?: boolean;
}

export const materiaisApi = {
  listar: (filters?: MaterialFilters) =>
    request<any[]>('/materiais', { params: filters as any }),
};

// ===========================================
// ENDPOINTS - SUBUNIDADES
// ===========================================

export const subunidadesApi = {
  listar: () =>
    request<any[]>('/subunidades'),

  criar: (data: { nome: string; sigla: string }) =>
    request<any>('/subunidades', { method: 'POST', body: data }),
};

// ===========================================
// ENDPOINTS - DASHBOARD
// ===========================================

export const dashboardApi = {
  efetivo: () =>
    request<any>('/dashboard/efetivo'),

  vencimentos: (dias?: number) =>
    request<any>('/dashboard/vencimentos', { params: { dias } }),

  alertas: () =>
    request<any>('/dashboard/alertas'),

  ocorrencias: (periodo?: number) =>
    request<any>('/dashboard/ocorrencias', { params: { periodo } }),

  viaturas: () =>
    request<any>('/dashboard/viaturas'),
};

// ===========================================
// ENDPOINTS - UTILITÁRIAS
// ===========================================

export const utilApi = {
  health: () =>
    request<{ status: string; version: string }>('/health'),

  constantes: () =>
    request<any>('/constantes'),
};

// ===========================================
// ENDPOINTS - AUDITORIA
// ===========================================

export interface AuditoriaFilters {
  page?: number;
  limit?: number;
  tabela?: string;
  usuario?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const auditoriaApi = {
  listar: (filters?: AuditoriaFilters) =>
    request<any[]>('/auditoria', { params: filters as any }),
};

// Export default com todos os serviços
export default {
  policiais: policiaisApi,
  afastamentos: afastamentosApi,
  restricoes: restricoesApi,
  ocorrencias: ocorrenciasApi,
  operacoes: operacoesApi,
  viaturas: viaturasApi,
  manutencoes: manutencoesApi,
  materiais: materiaisApi,
  subunidades: subunidadesApi,
  dashboard: dashboardApi,
  util: utilApi,
  auditoria: auditoriaApi,
};
