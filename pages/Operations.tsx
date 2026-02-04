import React from 'react';
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
import { Map, Target, AlertTriangle, FileText } from 'lucide-react';
import { mockIndicadores, mockOcorrencias } from '../data';

export const Operations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planejamento Operacional (P/3)</h1>
          <p className="text-sm text-gray-500 mt-1">Indicadores, mapas de calor e controle de operações.</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
             Relatório Mensal
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-p3 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors">
            <Target className="w-4 h-4 mr-2" />
            Nova Operação
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Boletins Registrados</p>
            <p className="text-2xl font-bold text-gray-900">145</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Área Patrulhada</p>
            <p className="text-2xl font-bold text-gray-900">1.250 km²</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Crimes Ambientais</p>
            <p className="text-2xl font-bold text-gray-900">32</p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Produtividade Mensal Comparativa</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockIndicadores}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="bos" name="Ocorrências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="autos" name="Autos Infração" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atendimentos" name="Atendimentos" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Operações em Andamento</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-p3 transition-colors">
              <div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                  <h4 className="font-bold text-gray-900">Operação Impacto Ambiental</h4>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-4">Foco: Fiscalização de pesca predatória na represa de Paraibuna.</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Efetivo</p>
                  <p className="font-medium">12 Militares</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Início</p>
                  <p className="font-medium">06:00</p>
                </div>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Detalhes</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-p3 transition-colors">
              <div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                  <h4 className="font-bold text-gray-900">Operação Corta-Fogo</h4>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-4">Foco: Prevenção a queimadas na Serra da Mantiqueira.</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Efetivo</p>
                  <p className="font-medium">8 Militares</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Início</p>
                  <p className="font-medium">08:00</p>
                </div>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Detalhes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};