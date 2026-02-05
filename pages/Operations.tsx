import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Map,
  Target,
  AlertTriangle,
  FileText,
  RefreshCw,
  Loader2,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { useP3, useOcorrencias, useOperacoesList, useTiposOcorrencia } from '../hooks/useOperacoes';
import { useDashboardOcorrencias } from '../hooks/useDashboard';

const STATUS_LABELS: Record<string, string> = {
  REGISTRADA: 'Registrada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  ARQUIVADA: 'Arquivada',
};

const STATUS_COLORS: Record<string, string> = {
  REGISTRADA: 'bg-blue-100 text-blue-800',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDA: 'bg-green-100 text-green-800',
  ARQUIVADA: 'bg-gray-100 text-gray-800',
};

export const Operations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ocorrencias' | 'operacoes'>('ocorrencias');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce do searchTerm para evitar muitas chamadas à API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hooks da API - filtros passados para o BACKEND processar
  const ocorrencias = useOcorrencias({
    limit: 20,
    busca: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });
  const operacoes = useOperacoesList({ ativa: true });
  const tiposOcorrencia = useTiposOcorrencia();
  const dashboardStats = useDashboardOcorrencias(30);

  const loading = ocorrencias.loading || operacoes.loading;

  // Recarregar quando filtros mudarem
  useEffect(() => {
    ocorrencias.refetch();
  }, [debouncedSearch, statusFilter]);

  // Dados para o gráfico
  const chartData = dashboardStats.data?.porTipo?.map((item: any) => ({
    name: item.tipo,
    quantidade: item.quantidade,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planejamento Operacional (P/3)</h1>
          <p className="text-sm text-gray-500 mt-1">Ocorrências, operações e indicadores operacionais.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              ocorrencias.refetch();
              operacoes.refetch();
              dashboardStats.refetch();
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nova Ocorrência
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ocorrências (30d)</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardStats.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dashboardStats.data?.total || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Área Patrulhada</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardStats.loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                `${Math.round(Number(dashboardStats.data?.areaPatrulhadaKm) || 0)} km²`}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Autos de Infração</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardStats.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dashboardStats.data?.autosInfracao || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Operações Ativas</p>
            <p className="text-2xl font-bold text-gray-900">
              {operacoes.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : operacoes.data?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ocorrencias')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ocorrencias'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ocorrências
          </button>
          <button
            onClick={() => setActiveTab('operacoes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operacoes'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Operações
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'ocorrencias' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, local ou município..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="REGISTRADA">Registrada</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="ARQUIVADA">Arquivada</option>
            </select>
          </div>

          {/* Ocorrências Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Número</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Local</th>
                    <th className="px-6 py-3">Data/Hora</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Responsável</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ocorrencias.loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                        <p className="mt-2 text-gray-500">Carregando ocorrências...</p>
                      </td>
                    </tr>
                  ) : ocorrencias.error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                        {ocorrencias.error}
                      </td>
                    </tr>
                  ) : ocorrencias.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma ocorrência encontrada
                      </td>
                    </tr>
                  ) : (
                    ocorrencias.data.map((oc: any) => (
                      <tr key={oc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{oc.numero}</td>
                        <td className="px-6 py-4">{oc.tipo?.nome || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div>{oc.local}</div>
                          <div className="text-xs text-gray-500">{oc.municipio}</div>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(oc.dataHora).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[oc.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[oc.status] || oc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {oc.policialResponsavel ? (
                            <span className="text-sm">{oc.policialResponsavel.nomeGuerra}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1 text-gray-500 hover:text-blue-600" title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-orange-600" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {ocorrencias.pagination && ocorrencias.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {ocorrencias.data.length} de {ocorrencias.pagination.total} ocorrências
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => ocorrencias.setPage(ocorrencias.pagination!.page - 1)}
                    disabled={ocorrencias.pagination.page === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {ocorrencias.pagination.page} / {ocorrencias.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => ocorrencias.setPage(ocorrencias.pagination!.page + 1)}
                    disabled={ocorrencias.pagination.page === ocorrencias.pagination.totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Ocorrências por Tipo (30 dias)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantidade" name="Quantidade" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'operacoes' && (
        <div className="space-y-6">
          {/* Operations List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Operações Ativas</h3>
              <button className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4 mr-1" />
                Nova Operação
              </button>
            </div>
            <div className="p-6">
              {operacoes.loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                  <p className="mt-2 text-gray-500">Carregando operações...</p>
                </div>
              ) : operacoes.error ? (
                <div className="text-center py-8 text-red-500">{operacoes.error}</div>
              ) : operacoes.data && operacoes.data.length > 0 ? (
                <div className="space-y-4">
                  {operacoes.data.map((op: any) => (
                    <div
                      key={op.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center">
                          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${op.ativa ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <h4 className="font-bold text-gray-900">{op.nome}</h4>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-4">
                          {op.descricao || op.objetivo?.substring(0, 100) + '...'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 ml-4">
                          Local: {op.localidade}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-4 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Efetivo</p>
                          <p className="font-medium">{op.efetivoReal || op.efetivoPrevisto} militares</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Início</p>
                          <p className="font-medium">
                            {new Date(op.dataInicio).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Viaturas</p>
                          <p className="font-medium">{op.viaturasUtilizadas}</p>
                        </div>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>Nenhuma operação ativa no momento</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
