/**
 * SIGO - Página de Administração de Pessoal (P/1)
 * Gestão de Efetivo da 4ª Companhia - 3º BPAmb
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  FileDown,
  Users,
  UserPlus,
  AlertTriangle,
  List,
  LayoutGrid,
  Info,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { StatusOperacional, PostoGraduacao } from '../types';
import { usePoliciais, useSubunidades, useAfastamentos, useRestricoes } from '../hooks/usePoliciais';
import { useDashboardEfetivo } from '../hooks/useDashboard';
import { ErrorBoundary } from '../components/common';
import {
  FichaIndividual,
  EfetivoTable,
  FormularioCadastro,
  RestricoesPanel,
} from '../components/personnel';
import type { Policial, EfetivoStats, ordenarPorAntiguidade } from '../types/personnel';

export const Personnel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EFETIVO' | 'CADASTRO' | 'RESTRICOES'>('EFETIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'GERAL' | 'OPM'>('GERAL');
  const [selectedPolicial, setSelectedPolicial] = useState<Policial | null>(null);

  // Debounce do searchTerm para evitar muitas chamadas à API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hooks da API - filtros passados para o BACKEND processar
  const policiaisApi = usePoliciais({
    ativo: true,
    busca: debouncedSearch || undefined,
  });
  const subunidadesApi = useSubunidades();
  const dashboardEfetivo = useDashboardEfetivo();
  const afastamentosApi = useAfastamentos({ ativo: true });
  const restricoesApi = useRestricoes({ ativo: true });

  // Recarregar quando filtro mudar
  useEffect(() => {
    policiaisApi.refetch();
  }, [debouncedSearch]);

  // Estado de loading
  const loading = policiaisApi.loading || dashboardEfetivo.loading;

  // Função para atualizar dados
  const refetchAll = () => {
    policiaisApi.refetch();
    dashboardEfetivo.refetch();
    afastamentosApi.refetch();
    restricoesApi.refetch();
  };

  // Função de ordenação por antiguidade
  const ordenarPorAntiguidade = (a: Policial, b: Policial): number => {
    const ORDEM_POSTO: Record<PostoGraduacao, number> = {
      'CAP': 9, '1TEN': 8, '2TEN': 7, 'SUBTEN': 6,
      '1SGT': 5, '2SGT': 4, '3SGT': 3, 'CB': 2, 'SD': 1,
    };

    const postoA = ORDEM_POSTO[a.posto] || 0;
    const postoB = ORDEM_POSTO[b.posto] || 0;

    if (postoA !== postoB) {
      return postoB - postoA;
    }

    if (a.posto !== 'SD' && b.posto !== 'SD') {
      const dataPromocaoA = a.dataPromocao ? new Date(a.dataPromocao).getTime() : Date.now();
      const dataPromocaoB = b.dataPromocao ? new Date(b.dataPromocao).getTime() : Date.now();
      return dataPromocaoA - dataPromocaoB;
    }

    if (a.posto === 'SD' && b.posto === 'SD') {
      const dataIngressoA = a.dataIngresso ? new Date(a.dataIngresso).getTime() : Date.now();
      const dataIngressoB = b.dataIngresso ? new Date(b.dataIngresso).getTime() : Date.now();
      return dataIngressoA - dataIngressoB;
    }

    return 0;
  };

  // Transformar dados da API para o formato esperado pelo componente
  const efetivoFiltrado = useMemo(() => {
    if (!policiaisApi.data || policiaisApi.data.length === 0) {
      return [];
    }

    // Mapear dados da API para interface Policial
    const policiaisTransformados: Policial[] = policiaisApi.data.map((p: any) => ({
      id: p.id,
      re: p.re + (p.digito ? `-${p.digito}` : ''),
      posto: p.posto as PostoGraduacao,
      nomeGuerra: p.nomeGuerra,
      nomeCompleto: p.nome,
      funcao: p.funcao || '',
      pelotao: p.subunidade?.sigla || '',
      subunidade: p.subunidade?.nome || '4ª Cia',
      status: p.statusOperacional === 'APTO' ? StatusOperacional.APTO :
              p.statusOperacional === 'APTO_COM_RESTRICAO' ? StatusOperacional.APTO_COM_RESTRICAO :
              StatusOperacional.AFASTADO,
      dataPromocao: p.dataPromocao || undefined,
      dataIngresso: p.dataInclusao || undefined,
      dataNascimento: p.dataNascimento || undefined,
      email: p.email || undefined,
      telefone: p.telefone || undefined,
      restricoes: p.restricoes?.map((r: any) => ({
        id: r.id,
        codigos: r.codigos,
        parecer: r.parecerMedico || '',
        dataInicio: r.dataInicio,
        dataFim: r.dataFim,
        documento: r.documento,
        status: 'ATIVO' as const,
      })) || [],
      afastamento: p.afastamentos?.[0] ? {
        id: p.afastamentos[0].id,
        tipoId: p.afastamentos[0].tipo,
        dataInicio: p.afastamentos[0].dataInicio,
        dataFim: p.afastamentos[0].dataFim,
        documento: p.afastamentos[0].documento || '',
        status: 'ATIVO' as const,
      } : undefined,
    }));

    return policiaisTransformados.sort(ordenarPorAntiguidade);
  }, [policiaisApi.data]);

  // Agrupar por OPM
  const efetivoAgrupado = useMemo(() => {
    const grupos: Record<string, Policial[]> = {
      '4ª Cia': [],
      '1º Pel': [],
      'BOp Campos do Jordão': [],
      '2º Pel': [],
      'BOp Cruzeiro': [],
      '3º Pel': [],
    };

    efetivoFiltrado.forEach(m => {
      if (grupos[m.subunidade] !== undefined) {
        grupos[m.subunidade].push(m);
      }
    });

    Object.keys(grupos).forEach(key => {
      grupos[key].sort(ordenarPorAntiguidade);
    });

    return grupos;
  }, [efetivoFiltrado]);

  // Estatísticas - usa API do dashboard
  const stats: EfetivoStats = useMemo(() => {
    return {
      total: dashboardEfetivo.data?.total || 0,
      aptos: dashboardEfetivo.data?.aptos || 0,
      restricao: dashboardEfetivo.data?.comRestricao || 0,
      afastados: dashboardEfetivo.data?.afastados || 0,
      ultimaAtualizacao: dashboardEfetivo.data?.ultimaAtualizacao || null,
    };
  }, [dashboardEfetivo.data]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Modal Ficha Individual */}
        {selectedPolicial && (
          <FichaIndividual
            policial={selectedPolicial}
            onClose={() => setSelectedPolicial(null)}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administração de Pessoal (P/1)</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestão de Efetivo da 4ª Companhia - 3º BPAmb
              {stats.ultimaAtualizacao && (
                <span className="ml-2 text-xs text-gray-400">
                  | Última atualização: {new Date(stats.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refetchAll}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('EFETIVO')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'EFETIVO'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Quadro de Efetivo
            </button>
            <button
              onClick={() => setActiveTab('CADASTRO')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'CADASTRO'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Cadastrar Policial
            </button>
            <button
              onClick={() => setActiveTab('RESTRICOES')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'RESTRICOES'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Restrições e Afastamentos
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'EFETIVO' && (
          <ErrorBoundary>
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Buscar por nome, nome de guerra ou RE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 mr-2">Visualização:</span>
                  <button
                    onClick={() => setViewMode('GERAL')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'GERAL'
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4 mr-1.5" />
                    Geral
                  </button>
                  <button
                    onClick={() => setViewMode('OPM')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'OPM'
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 mr-1.5" />
                    Por OPM
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Ordenação por Antiguidade:</strong> A lista é ordenada por posto/graduação (maior primeiro).
                  Em caso de mesmo posto, a ordenação segue pela data de promoção (mais antigo primeiro).
                  Para Sd PM, a ordenação é pela data de ingresso.
                  <strong className="ml-2">Clique no ícone</strong> <Eye className="w-4 h-4 inline text-blue-600" /> <strong>para abrir a ficha completa do policial.</strong>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Carregando efetivo...</span>
                </div>
              )}

              {/* Tabela */}
              {!loading && (
                <EfetivoTable
                  efetivo={efetivoFiltrado}
                  efetivoAgrupado={efetivoAgrupado}
                  stats={stats}
                  viewMode={viewMode}
                  searchTerm={debouncedSearch}
                  onViewPolicial={setSelectedPolicial}
                />
              )}
            </div>
          </ErrorBoundary>
        )}

        {activeTab === 'CADASTRO' && (
          <ErrorBoundary>
            <FormularioCadastro />
          </ErrorBoundary>
        )}

        {activeTab === 'RESTRICOES' && (
          <ErrorBoundary>
            <RestricoesPanel
              stats={stats}
              efetivo={efetivoFiltrado}
              onViewPolicial={setSelectedPolicial}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Personnel;
