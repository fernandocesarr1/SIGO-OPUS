/**
 * SIGO - Componente de Tabela de Efetivo
 * Exibe lista de policiais em modo geral ou agrupado por OPM
 */

import React, { useState } from 'react';
import {
  Eye,
  Edit,
  ChevronDown,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { POSTO_LABELS, StatusOperacional } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { Policial, EfetivoStats } from '../../types/personnel';

interface EfetivoTableProps {
  efetivo: Policial[];
  efetivoAgrupado: Record<string, Policial[]>;
  stats: EfetivoStats;
  viewMode: 'GERAL' | 'OPM';
  searchTerm: string;
  onViewPolicial: (policial: Policial) => void;
  onEditPolicial?: (policial: Policial) => void;
}

export const EfetivoTable: React.FC<EfetivoTableProps> = ({
  efetivo,
  efetivoAgrupado,
  stats,
  viewMode,
  searchTerm,
  onViewPolicial,
  onEditPolicial,
}) => {
  const [expandedOPMs, setExpandedOPMs] = useState<string[]>(['4ª Cia', '1º Pel', '2º Pel', '3º Pel']);

  const toggleOPM = (opm: string) => {
    setExpandedOPMs(prev =>
      prev.includes(opm)
        ? prev.filter(o => o !== opm)
        : [...prev, opm]
    );
  };

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

  const EfetivoRow = ({ m, index }: { m: Policial; index: number }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-center text-sm text-gray-500 font-mono">{index + 1}</td>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900">{POSTO_LABELS[m.posto]}</span>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-gray-600">{m.re}</td>
      <td className="px-4 py-3">
        <div>
          <span className="font-medium text-gray-900">{m.nomeCompleto}</span>
          <span className="text-xs text-gray-500 ml-2">({m.nomeGuerra})</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="text-gray-900">{m.subunidade}</span>
          {m.pelotao && <span className="text-xs text-gray-500 block">{m.pelotao}</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{m.funcao}</td>
      <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewPolicial(m)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Visualizar Ficha"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onEditPolicial && (
            <button
              onClick={() => onEditPolicial(m)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const TabelaGeral = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-12">Nº</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Posto/Grad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">RE</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OPM</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Função</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {efetivo.map((m, index) => (
              <EfetivoRow key={m.id} m={m} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total: <span className="font-bold">{efetivo.length}</span> policiais militares
          {searchTerm && ` (filtrado de ${stats.total})`}
        </p>
      </div>
    </div>
  );

  const TabelaAgrupada = () => {
    const renderGrupo = (opm: string, policiais: Policial[], nivel: number = 0) => {
      const isExpanded = expandedOPMs.includes(opm);
      const isSubordinado = nivel > 0 || opm === 'BOp Campos do Jordão' || opm === 'BOp Cruzeiro';

      return (
        <div key={opm} className={`${isSubordinado ? 'ml-6' : ''}`}>
          <button
            onClick={() => toggleOPM(opm)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
              isSubordinado
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <div className="flex items-center">
              {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
              <Building2 className="w-4 h-4 mr-2" />
              <span>{opm}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isSubordinado ? 'bg-gray-200 text-gray-600' : 'bg-primary-500 text-white'
              }`}>
                {policiais.length} PM
              </span>
            </div>
          </button>

          {isExpanded && policiais.length > 0 && (
            <div className="overflow-x-auto border-l-2 border-primary-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 w-12">Nº</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Posto/Grad</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">RE</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Função</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {policiais.map((m, index) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-center text-gray-500 font-mono">{index + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{POSTO_LABELS[m.posto]}</td>
                      <td className="px-4 py-2 font-mono text-gray-600">{m.re}</td>
                      <td className="px-4 py-2">
                        <span className="font-medium text-gray-900">{m.nomeCompleto}</span>
                        <span className="text-xs text-gray-500 ml-2">({m.nomeGuerra})</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{m.funcao}</td>
                      <td className="px-4 py-2">{getStatusBadge(m.status)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewPolicial(m)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Visualizar Ficha"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onEditPolicial && (
                            <button
                              onClick={() => onEditPolicial(m)}
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {renderGrupo('4ª Cia', efetivoAgrupado['4ª Cia'] || [])}
          {renderGrupo('1º Pel', efetivoAgrupado['1º Pel'] || [])}
          {expandedOPMs.includes('1º Pel') && renderGrupo('BOp Campos do Jordão', efetivoAgrupado['BOp Campos do Jordão'] || [], 1)}
          {renderGrupo('2º Pel', efetivoAgrupado['2º Pel'] || [])}
          {expandedOPMs.includes('2º Pel') && renderGrupo('BOp Cruzeiro', efetivoAgrupado['BOp Cruzeiro'] || [], 1)}
          {renderGrupo('3º Pel', efetivoAgrupado['3º Pel'] || [])}
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Geral: <span className="font-bold">{stats.total}</span> policiais militares
          </p>
        </div>
      </div>
    );
  };

  return viewMode === 'GERAL' ? <TabelaGeral /> : <TabelaAgrupada />;
};

export default EfetivoTable;
