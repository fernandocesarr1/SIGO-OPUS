import React from 'react';
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
  Legend
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { dashboardStats, mockIndicadores, mockOcorrencias } from '../data';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
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
                <stat.icon className={`w-6 h-6 text-${stat.color.replace('bg-', '')}-600`} style={{ color: stat.color === 'bg-p1' ? '#8b5cf6' : stat.color === 'bg-p3' ? '#f97316' : stat.color === 'bg-p4' ? '#06b6d4' : '#ef4444' }} />
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
        {/* Productivity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Indicadores Operacionais</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockIndicadores} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAutos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#374151' }}
                />
                <Area type="monotone" dataKey="bos" stroke="#10b981" fillOpacity={1} fill="url(#colorBos)" name="BOs" />
                <Area type="monotone" dataKey="autos" stroke="#f97316" fillOpacity={1} fill="url(#colorAutos)" name="Autos de Infração" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Situação do Efetivo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ativos', value: 120 },
                    { name: 'Férias', value: 12 },
                    { name: 'Licença', value: 5 },
                    { name: 'Afastados', value: 3 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">Total de Militares</p>
            <p className="text-2xl font-bold text-gray-800">140</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Últimas Ocorrências</h3>
            <button className="text-primary-600 text-sm hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">ID / Tipo</th>
                  <th className="px-6 py-3">Local</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {mockOcorrencias.map((oc) => (
                  <tr key={oc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="font-bold">{oc.tipo}</div>
                      <div className="text-xs text-gray-500">{oc.id}</div>
                    </td>
                    <td className="px-6 py-4">{oc.local}</td>
                    <td className="px-6 py-4">{oc.data}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        oc.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                        oc.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {oc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Eventos do Dia</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="ml-2">
                <p className="text-sm font-bold text-blue-900">Preleção Geral</p>
                <p className="text-xs text-blue-700">08:00 - Auditório Cia</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="ml-2">
                <p className="text-sm font-bold text-green-900">Operação Corta-Fogo</p>
                <p className="text-xs text-green-700">10:00 - Área Rural</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <div className="ml-2">
                <p className="text-sm font-bold text-orange-900">Manutenção VTR A-03402</p>
                <p className="text-xs text-orange-700">14:00 - Oficina</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 px-4 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Ver Calendário Completo
          </button>
        </div>
      </div>
    </div>
  );
};