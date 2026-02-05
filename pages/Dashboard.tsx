import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  MoreVertical,
  Users,
  FileText,
  Truck,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useOcorrencias } from '../hooks/useOperacoes';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const STATUS_LABELS: Record<string, string> = {
  REGISTRADA: 'Registrada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  ARQUIVADA: 'Arquivada',
};

export const Dashboard: React.FC = () => {
  const { stats, efetivo, ocorrencias, viaturas, alertas, loading, error, refetchAll } = useDashboard();
  const ocorrenciasRecentes = useOcorrencias({ limit: 5 });

  // Dados para o gráfico de pizza do efetivo
  const efetivoChartData = efetivo.data ? [
    { name: 'Aptos', value: efetivo.data.aptos },
    { name: 'Com Restrição', value: efetivo.data.comRestricao },
    { name: 'Afastados', value: efetivo.data.afastados },
  ].filter(item => item.value > 0) : [];

  // Dados para o gráfico de ocorrências por tipo
  const ocorrenciasPorTipo = ocorrencias.data?.porTipo || [];

  // Stats cards dinâmicos
  const dashboardStats = [
    {
      title: "Efetivo Ativo",
      value: stats.efetivoAtivo,
      change: `${stats.efetivoAptos} aptos`,
      trend: "up" as const,
      icon: Users,
      color: "bg-purple-500"
    },
    {
      title: "Ocorrências (Mês)",
      value: stats.totalOcorrencias,
      change: `${stats.autosInfracao} autos`,
      trend: stats.totalOcorrencias > 0 ? "up" as const : "neutral" as const,
      icon: FileText,
      color: "bg-orange-500"
    },
    {
      title: "Viaturas Disp.",
      value: `${stats.viaturasDisponiveis}/${stats.viaturasTotal}`,
      change: `${stats.viaturasManutencao} em manutenção`,
      trend: stats.viaturasManutencao > 0 ? "down" as const : "up" as const,
      icon: Truck,
      color: "bg-cyan-500"
    },
    {
      title: "Alertas",
      value: stats.totalAlertas,
      change: stats.totalAlertas > 0 ? "Ação requerida" : "Nenhum alerta",
      trend: stats.totalAlertas > 0 ? "neutral" as const : "up" as const,
      icon: AlertTriangle,
      color: "bg-red-500"
    },
  ];

  // Loading state
  if (loading && !efetivo.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error && !efetivo.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Erro ao carregar dashboard</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetchAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={refetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6`} style={{ color: stat.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#8b5cf6' : stat.color.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' : stat.color.replace('bg-', '').replace('-500', '') === 'cyan' ? '#06b6d4' : '#ef4444' }} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />}
              {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
              {stat.trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400 mr-1" />}
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-green-600' :
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ocorrências por Tipo Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Ocorrências por Tipo</h3>
            <span className="text-sm text-gray-500">Últimos 30 dias</span>
          </div>
          <div className="h-80 w-full">
            {ocorrenciasPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ocorrenciasPorTipo} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="tipo"
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="quantidade" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Nenhuma ocorrência registrada no período</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Situação do Efetivo</h3>
          <div className="h-64 w-full">
            {efetivoChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={efetivoChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {efetivoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Carregando dados...</p>
              </div>
            )}
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">Total de Militares</p>
            <p className="text-2xl font-bold text-gray-800">{stats.efetivoAtivo}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Últimas Ocorrências</h3>
            <button
              onClick={() => ocorrenciasRecentes.refetch()}
              className="text-purple-600 text-sm hover:underline flex items-center gap-1"
            >
              {ocorrenciasRecentes.loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Atualizar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Número / Tipo</th>
                  <th className="px-6 py-3">Local</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ocorrenciasRecentes.data && ocorrenciasRecentes.data.length > 0 ? (
                  ocorrenciasRecentes.data.map((oc: any) => (
                    <tr key={oc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="font-bold">{oc.tipo?.nome || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{oc.numero}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{oc.local}</div>
                        <div className="text-xs text-gray-500">{oc.municipio}</div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(oc.dataHora).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          oc.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                          oc.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                          oc.status === 'ARQUIVADA' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {STATUS_LABELS[oc.status] || oc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {ocorrenciasRecentes.loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando...
                        </div>
                      ) : ocorrenciasRecentes.error ? (
                        <span className="text-red-500">{ocorrenciasRecentes.error}</span>
                      ) : (
                        'Nenhuma ocorrência registrada'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Alertas</h3>
            <AlertTriangle className={`w-5 h-5 ${stats.totalAlertas > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <div className="space-y-4">
            {alertas.data?.restricoesCriticas && alertas.data.restricoesCriticas.length > 0 && (
              <div className="flex items-start p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="ml-2">
                  <p className="text-sm font-bold text-red-900">Restrições Críticas</p>
                  <p className="text-xs text-red-700">
                    {alertas.data.restricoesCriticas.length} policial(is) com códigos críticos
                  </p>
                </div>
              </div>
            )}

            {alertas.data?.viaturasManutencao && alertas.data.viaturasManutencao.length > 0 && (
              <div className="flex items-start p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="ml-2">
                  <p className="text-sm font-bold text-orange-900">Viaturas em Manutenção</p>
                  <p className="text-xs text-orange-700">
                    {alertas.data.viaturasManutencao.map((v: any) => v.prefixo).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {alertas.data?.afastamentosVencendo > 0 && (
              <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="ml-2">
                  <p className="text-sm font-bold text-blue-900">Afastamentos Vencendo</p>
                  <p className="text-xs text-blue-700">
                    {alertas.data.afastamentosVencendo} vencendo em 7 dias
                  </p>
                </div>
              </div>
            )}

            {alertas.data?.materiaisAlerta > 0 && (
              <div className="flex items-start p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="ml-2">
                  <p className="text-sm font-bold text-yellow-900">Estoque Baixo</p>
                  <p className="text-xs text-yellow-700">
                    {alertas.data.materiaisAlerta} material(is) abaixo do mínimo
                  </p>
                </div>
              </div>
            )}

            {stats.totalAlertas === 0 && (
              <div className="flex items-start p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="ml-2">
                  <p className="text-sm font-bold text-green-900">Tudo em ordem</p>
                  <p className="text-xs text-green-700">Nenhum alerta no momento</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
