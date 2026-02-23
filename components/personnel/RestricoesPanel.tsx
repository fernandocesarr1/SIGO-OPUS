/**
 * SIGO - Painel de Restrições e Afastamentos
 * Exibe estatísticas e lista de militares com restrições/afastamentos
 */

import React from 'react';
import {
  UserCheck,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { POSTO_LABELS, StatusOperacional } from '../../types';
import { TIPOS_AFASTAMENTO } from '../../data';
import { CheckCircle2 } from 'lucide-react';
import type { Policial, EfetivoStats } from '../../types/personnel';

interface RestricoesPanelProps {
  stats: EfetivoStats;
  efetivo: Policial[];
  onViewPolicial: (policial: Policial) => void;
  onNovaRestricao?: () => void;
  onNovoAfastamento?: () => void;
}

export const RestricoesPanel: React.FC<RestricoesPanelProps> = ({
  stats,
  efetivo,
  onViewPolicial,
  onNovaRestricao,
  onNovoAfastamento,
}) => {
  const chartData = [
    { name: 'Aptos', value: stats.aptos, color: '#10b981' },
    { name: 'Com Restrição', value: stats.restricao, color: '#f59e0b' },
    { name: 'Afastados', value: stats.afastados, color: '#ef4444' },
  ];

  const getStatusBadge = (status: StatusOperacional) => {
    switch (status) {
      case StatusOperacional.APTO:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> APTO</span>;
      case StatusOperacional.APTO_COM_RESTRICAO:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" /> RESTRIÇÃO</span>;
      case StatusOperacional.AFASTADO:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> AFASTADO</span>;
    }
  };

  const militaresComRestricao = efetivo.filter(m => m.status !== StatusOperacional.APTO);

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Efetivo Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
          <p className="text-sm text-green-700 font-medium flex items-center"><UserCheck className="w-4 h-4 mr-1"/> Aptos</p>
          <p className="text-2xl font-bold text-green-900">{stats.aptos}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-sm text-orange-700 font-medium flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> Com Restrição</p>
          <p className="text-2xl font-bold text-orange-900">{stats.restricao}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
          <p className="text-sm text-red-700 font-medium flex items-center"><XCircle className="w-4 h-4 mr-1"/> Afastados</p>
          <p className="text-2xl font-bold text-red-900">{stats.afastados}</p>
        </div>
      </div>

      {/* Gráfico e ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Distribuição por Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onNovaRestricao}
              className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-orange-900">Nova Restrição Médica</p>
                <p className="text-xs text-orange-700">40 códigos conforme BG PM 166/06</p>
              </div>
            </button>
            <button
              onClick={onNovoAfastamento}
              className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Clock className="w-5 h-5 text-red-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-red-900">Novo Afastamento</p>
                <p className="text-xs text-red-700">18 tipos conforme I-36-PM</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de militares com restrições/afastamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700">Militares com Restrições ou Afastamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Militar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">OPM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Detalhes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Vigência</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {militaresComRestricao.length > 0 ? (
                militaresComRestricao.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{POSTO_LABELS[m.posto]} {m.nomeGuerra}</div>
                      <div className="text-xs text-gray-500">RE: {m.re}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.subunidade}</td>
                    <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                    <td className="px-4 py-3">
                      {m.restricoes && m.restricoes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.restricoes[0].codigos.map((code: string) => (
                            <span key={code} className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                              ['UA', 'PO', 'DV', 'SE'].includes(code)
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.afastamento && (
                        <span className="text-red-700 font-medium text-xs">
                          {TIPOS_AFASTAMENTO.find(t => t.id === m.afastamento?.tipoId)?.label || m.afastamento.tipoId}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {m.restricoes && m.restricoes.length > 0 && (
                        <span className="text-orange-700">{new Date(m.restricoes[0].dataFim).toLocaleDateString('pt-BR')}</span>
                      )}
                      {m.afastamento && (
                        <span className="text-red-700">
                          {m.afastamento.dataFim ? new Date(m.afastamento.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewPolicial(m)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver Ficha Completa"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum militar com restrição ou afastamento</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestricoesPanel;
