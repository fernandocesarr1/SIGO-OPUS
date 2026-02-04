import React from 'react';
import { Truck, Wrench, AlertCircle, Plus, PenTool } from 'lucide-react';
import { mockViaturas } from '../data';

export const Logistics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logística e Patrimônio (P/4)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de frota, armamento e almoxarifado.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-p4 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nova Cautela
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-p4" />
              Controle de Frota
            </h3>
            <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded">Total: {mockViaturas.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Prefixo</th>
                  <th className="px-6 py-3">Veículo</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockViaturas.map((vtr) => (
                  <tr key={vtr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium">{vtr.prefixo}</td>
                    <td className="px-6 py-4">
                      <div>{vtr.modelo}</div>
                      <div className="text-xs text-gray-500">{vtr.placa}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vtr.status === 'Disponível' ? 'bg-green-100 text-green-800' :
                        vtr.status === 'Em Uso' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vtr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{vtr.km.toLocaleString()} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance / Alerts Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 flex items-center mb-4">
              <Wrench className="w-5 h-5 mr-2 text-orange-500" />
              Próximas Manutenções
            </h3>
            <div className="space-y-4">
              <div className="flex items-start p-3 bg-orange-50 rounded-lg border border-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">VTR A-03403 (Hilux)</h4>
                  <p className="text-xs text-gray-600 mt-1">Revisão de 120.000km necessária. Agendado para 20/02.</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                <PenTool className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Extintores Sede Cia</h4>
                  <p className="text-xs text-gray-600 mt-1">Validade expira em 15 dias. Processo de recarga iniciado.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Resumo Material Bélico</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Armamento</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">100%</p>
                <p className="text-xs text-green-600 mt-1">Conferido hoje</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Munições</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">OK</p>
                <p className="text-xs text-gray-500 mt-1">Estoque regular</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};