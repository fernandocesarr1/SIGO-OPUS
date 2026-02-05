import React, { useState, useEffect } from 'react';
import {
  Truck,
  Wrench,
  AlertCircle,
  Plus,
  PenTool,
  RefreshCw,
  Loader2,
  Search,
  Package,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useViaturas, useManutencoes, useMateriais } from '../hooks/useLogistica';
import { useDashboardViaturas } from '../hooks/useDashboard';

const STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  EM_USO: 'Em Uso',
  MANUTENCAO: 'Manutenção',
  BAIXADA: 'Baixada',
};

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: 'bg-green-100 text-green-800',
  EM_USO: 'bg-blue-100 text-blue-800',
  MANUTENCAO: 'bg-orange-100 text-orange-800',
  BAIXADA: 'bg-red-100 text-red-800',
};

export const Logistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viaturas' | 'manutencoes' | 'materiais'>('viaturas');
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
  const viaturas = useViaturas({
    busca: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });
  const manutencoes = useManutencoes({ concluida: false });
  const materiais = useMateriais({ estoqueMinimo: false });
  const materiaisAlerta = useMateriais({ estoqueMinimo: true });
  const dashboardViaturas = useDashboardViaturas();

  const loading = viaturas.loading || manutencoes.loading;

  // Recarregar quando filtros mudarem
  useEffect(() => {
    viaturas.refetch();
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logística e Patrimônio (P/4)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de frota, manutenções e materiais.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              viaturas.refetch();
              manutencoes.refetch();
              materiais.refetch();
              dashboardViaturas.refetch();
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nova Viatura
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-cyan-100 text-cyan-600 mr-4">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Viaturas</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardViaturas.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dashboardViaturas.data?.total || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Disponíveis</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardViaturas.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dashboardViaturas.data?.disponiveis || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Em Manutenção</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardViaturas.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dashboardViaturas.data?.manutencao || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Materiais Alerta</p>
            <p className="text-2xl font-bold text-gray-900">
              {materiaisAlerta.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (materiaisAlerta.data?.length || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('viaturas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'viaturas'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Viaturas
          </button>
          <button
            onClick={() => setActiveTab('manutencoes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manutencoes'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manutenções
          </button>
          <button
            onClick={() => setActiveTab('materiais')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'materiais'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Materiais
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'viaturas' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por prefixo, modelo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_USO">Em Uso</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="BAIXADA">Baixada</option>
            </select>
          </div>

          {/* Viaturas Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Prefixo</th>
                    <th className="px-6 py-3">Veículo</th>
                    <th className="px-6 py-3">Placa</th>
                    <th className="px-6 py-3">KM Atual</th>
                    <th className="px-6 py-3">Próx. Revisão</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {viaturas.loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
                        <p className="mt-2 text-gray-500">Carregando viaturas...</p>
                      </td>
                    </tr>
                  ) : viaturas.error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                        {viaturas.error}
                      </td>
                    </tr>
                  ) : viaturas.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma viatura encontrada
                      </td>
                    </tr>
                  ) : (
                    viaturas.data.map((vtr: any) => (
                      <tr key={vtr.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{vtr.prefixo}</td>
                        <td className="px-6 py-4">
                          <div>{vtr.modelo}</div>
                          <div className="text-xs text-gray-500">{vtr.marca} {vtr.ano && `(${vtr.ano})`}</div>
                        </td>
                        <td className="px-6 py-4 font-mono">{vtr.placa}</td>
                        <td className="px-6 py-4">{vtr.kmAtual?.toLocaleString()} km</td>
                        <td className="px-6 py-4">
                          {vtr.kmProxRevisao ? (
                            <span className={vtr.kmAtual >= vtr.kmProxRevisao ? 'text-red-600 font-medium' : ''}>
                              {vtr.kmProxRevisao.toLocaleString()} km
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[vtr.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[vtr.status] || vtr.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1 text-gray-500 hover:text-blue-600" title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-cyan-600" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-orange-600" title="Registrar Manutenção">
                              <Wrench className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'manutencoes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Manutenções em Andamento</h2>
            <button className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              Nova Manutenção
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Viatura</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Data Entrada</th>
                    <th className="px-6 py-3">KM Entrada</th>
                    <th className="px-6 py-3">Oficina</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {manutencoes.loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
                        <p className="mt-2 text-gray-500">Carregando manutenções...</p>
                      </td>
                    </tr>
                  ) : manutencoes.error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                        {manutencoes.error}
                      </td>
                    </tr>
                  ) : manutencoes.data && manutencoes.data.length > 0 ? (
                    manutencoes.data.map((m: any) => (
                      <tr key={m.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          <div>{m.viatura?.prefixo}</div>
                          <div className="text-xs text-gray-500">{m.viatura?.modelo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize">{m.tipo?.toLowerCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="truncate max-w-xs">{m.descricao}</p>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(m.dataEntrada).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">{m.kmEntrada?.toLocaleString()} km</td>
                        <td className="px-6 py-4">{m.oficina || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${m.concluida ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {m.concluida ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {m.concluida ? 'Concluída' : 'Em andamento'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>Nenhuma manutenção em andamento</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materiais' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Inventário de Materiais</h2>
            <button className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              Novo Material
            </button>
          </div>

          {materiaisAlerta.data && materiaisAlerta.data.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Alerta de Estoque Baixo</span>
              </div>
              <p className="mt-1 text-sm text-yellow-700">
                {materiaisAlerta.data.length} material(is) abaixo do estoque mínimo.
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Qtd. Atual</th>
                    <th className="px-6 py-3">Qtd. Mínima</th>
                    <th className="px-6 py-3">Localização</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {materiais.loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
                        <p className="mt-2 text-gray-500">Carregando materiais...</p>
                      </td>
                    </tr>
                  ) : materiais.error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                        {materiais.error}
                      </td>
                    </tr>
                  ) : materiais.data && materiais.data.length > 0 ? (
                    materiais.data.map((m: any) => {
                      const baixoEstoque = m.quantidadeAtual <= m.quantidadeMinima;
                      return (
                        <tr key={m.id} className={`border-b hover:bg-gray-50 transition-colors ${baixoEstoque ? 'bg-yellow-50' : 'bg-white'}`}>
                          <td className="px-6 py-4 font-mono font-medium">{m.codigo}</td>
                          <td className="px-6 py-4">{m.nome}</td>
                          <td className="px-6 py-4">{m.categoria}</td>
                          <td className="px-6 py-4">
                            <span className={baixoEstoque ? 'text-red-600 font-medium' : ''}>
                              {m.quantidadeAtual} {m.unidade}
                            </span>
                          </td>
                          <td className="px-6 py-4">{m.quantidadeMinima} {m.unidade}</td>
                          <td className="px-6 py-4">{m.localizacao || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${baixoEstoque ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {baixoEstoque ? 'Baixo' : 'OK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>Nenhum material cadastrado</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
