import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  FileDown,
  UserCheck,
  AlertTriangle,
  XCircle,
  Calendar,
  Save,
  X,
  Info,
  Clock,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { mockMilitares, CODIGOS_RESTRICAO, TIPOS_AFASTAMENTO } from '../data';
import { StatusOperacional, POSTO_LABELS } from '../types';

export const Personnel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'LIST' | 'FORM_AFASTAMENTO' | 'FORM_RESTRICAO'>('LIST');

  // --- DERIVED STATE ---
  const filteredMilitares = useMemo(() => mockMilitares.filter(m => 
    m.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.re.includes(searchTerm)
  ), [searchTerm]);

  const stats = useMemo(() => ({
    total: mockMilitares.length,
    aptos: mockMilitares.filter(m => m.status === StatusOperacional.APTO).length,
    restricao: mockMilitares.filter(m => m.status === StatusOperacional.APTO_COM_RESTRICAO).length,
    afastados: mockMilitares.filter(m => m.status === StatusOperacional.AFASTADO).length,
  }), []);

  const chartData = [
    { name: 'Aptos', value: stats.aptos, color: '#10b981' },
    { name: 'Com Restrição', value: stats.restricao, color: '#f59e0b' },
    { name: 'Afastados', value: stats.afastados, color: '#ef4444' },
  ];

  // --- ALERTS LOGIC ---
  const alerts = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expirations = mockMilitares.flatMap(m => {
      const alerts = [];
      if (m.restricoes) {
        m.restricoes.forEach(r => {
          const endDate = new Date(r.dataFim);
          if (endDate >= today && endDate <= nextWeek) {
            alerts.push({
              type: 'EXPIRATION',
              militar: m,
              message: `Restrição (${r.codigos.join(',')}) vence em ${Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))} dias`,
              date: r.dataFim
            });
          }
        });
      }
      if (m.afastamento && m.afastamento.dataFim) {
        const endDate = new Date(m.afastamento.dataFim);
        if (endDate >= today && endDate <= nextWeek) {
          alerts.push({
            type: 'EXPIRATION',
            militar: m,
            message: `Afastamento (${m.afastamento.tipoId}) termina em ${Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))} dias`,
            date: m.afastamento.dataFim
          });
        }
      }
      return alerts;
    });

    const criticals = mockMilitares.filter(m => 
      m.status === StatusOperacional.APTO_COM_RESTRICAO && 
      m.restricoes?.some(r => r.codigos.some(c => ['UA', 'PO', 'DV', 'SE'].includes(c)))
    ).map(m => ({
      type: 'CRITICAL',
      militar: m,
      message: `Restrição Crítica Ativa: ${m.restricoes![0].codigos.filter(c => ['UA', 'PO', 'DV', 'SE'].includes(c)).join(', ')}`
    }));

    return { expirations, criticals };
  }, []);

  // --- HELPERS ---
  const getStatusBadge = (status: StatusOperacional) => {
    switch (status) {
      case StatusOperacional.APTO:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> APTO</span>;
      case StatusOperacional.APTO_COM_RESTRICAO:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" /> COM RESTRIÇÃO</span>;
      case StatusOperacional.AFASTADO:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> AFASTADO</span>;
    }
  };

  const validateMedicalSecrecy = (text: string) => {
    const forbiddenTerms = ['CID', 'diagnóstico', 'patologia', 'doença', 'síndrome', 'transtorno', 'tumor', 'câncer', 'HIV', 'AIDS', 'psiquiátrico', 'depressão', 'ansiedade'];
    const found = forbiddenTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    if (found.length > 0) {
      return `⚠️ ATENÇÃO: O texto contém termos que podem violar sigilo médico (${found.join(', ')}).`;
    }
    return null;
  };

  // --- SUB-COMPONENTS ---

  const RestrictionForm = () => {
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [parecer, setParecer] = useState('');
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [dataFim, setDataFim] = useState('');
    const [obs, setObs] = useState('');
    const [obsWarning, setObsWarning] = useState<string | null>(null);

    const toggleCode = (code: string) => {
      let newCodes = [...selectedCodes];
      if (newCodes.includes(code)) {
        if (code === 'UU' && newCodes.includes('SE')) {
          alert('ATENÇÃO: Código UU é obrigatório quando SE está ativo (BG PM 232/08). Remova SE primeiro.');
          return;
        }
        newCodes = newCodes.filter(c => c !== code);
      } else {
        newCodes.push(code);
        if (code === 'SE' && !newCodes.includes('UU')) {
          newCodes.push('UU');
        }
      }
      setSelectedCodes(newCodes);
    };

    const handleObsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setObs(text);
      setObsWarning(validateMedicalSecrecy(text));
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
              Nova Restrição Médica
            </h2>
            <p className="text-sm text-gray-500 mt-1">Conformidade: BG PM 166/06 (40 Códigos) e BG PM 232/08</p>
          </div>
          <button onClick={() => setView('LIST')} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start">
             <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
             <p>Selecione os códigos abaixo. O sistema aplica automaticamente a regra <strong>SE → UU</strong>. Restrições críticas (UA, PO, DV) serão monitoradas no painel de alertas.</p>
           </div>

           <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Militar</label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5">
              <option value="">Selecione um militar...</option>
              {mockMilitares.map(m => (
                <option key={m.id} value={m.id}>{POSTO_LABELS[m.posto]} {m.nomeGuerra} (RE: {m.re})</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parecer Médico (Conforme JS/Atestado)</label>
            <select 
              value={parecer} 
              onChange={(e) => setParecer(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5"
            >
              <option value="">Selecione...</option>
              <option value="APTO_RESTRICAO">Apto com restrição</option>
              <option value="APTO_TEMP_RESTRICAO">Apto temporariamente com restrição</option>
              <option value="APTO">Apto (Fim de restrição)</option>
              <option value="INAPTO_TEMP">Inapto temporariamente (Gera Afastamento)</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Referência</label>
            <input type="text" placeholder="Ex: Ata de Inspeção de Saúde nº 123/2026, Atestado Validado..." className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5" 
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea 
              value={obs}
              onChange={handleObsChange}
              className={`w-full border rounded-lg shadow-sm focus:ring-p1 focus:border-p1 p-2.5 ${obsWarning ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-300'}`} 
              rows={2} 
              placeholder="Ex: Conforme ata da JS-2."
            />
            {obsWarning && (
              <p className="mt-1 text-xs text-yellow-700 font-bold">{obsWarning}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Códigos de Restrição (40 Códigos - BG PM 166/06)</label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-80 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Object.values(CODIGOS_RESTRICAO).map((code) => (
              <label 
                key={code.codigo} 
                className={`
                  flex flex-col p-2 rounded cursor-pointer border transition-all duration-200
                  ${selectedCodes.includes(code.codigo) 
                    ? 'bg-orange-50 border-orange-300 shadow-sm ring-1 ring-orange-200' 
                    : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'}
                  ${code.critico ? 'border-l-4 border-l-red-500' : ''}
                `}
              >
                <div className="flex items-center mb-1">
                  <input 
                    type="checkbox" 
                    checked={selectedCodes.includes(code.codigo)}
                    onChange={() => toggleCode(code.codigo)}
                    className="mr-2 text-orange-600 focus:ring-orange-500 rounded border-gray-300"
                  />
                  <span className={`font-bold text-sm ${code.critico ? 'text-red-700' : 'text-gray-900'}`}>{code.codigo}</span>
                </div>
                <span className="text-xs text-gray-500 leading-tight" title={code.descricao}>
                  {code.descricao}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button onClick={() => setView('LIST')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center shadow-sm transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Salvar Restrição
          </button>
        </div>
      </div>
    );
  };

  const LeaveForm = () => {
    const [tipoId, setTipoId] = useState('');
    const [indeterminado, setIndeterminado] = useState(false);
    const [obs, setObs] = useState('');
    const [obsWarning, setObsWarning] = useState<string | null>(null);
    
    const selectedTipo = TIPOS_AFASTAMENTO.find(t => t.id === tipoId);

    const handleObsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setObs(text);
      setObsWarning(validateMedicalSecrecy(text));
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-red-600" />
              Registrar Afastamento
            </h2>
            <p className="text-sm text-gray-500 mt-1">Conformidade: I-36-PM (3ª Edição) - 18 Tipos Legais</p>
          </div>
          <button onClick={() => setView('LIST')} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Militar</label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5">
              <option value="">Selecione um militar...</option>
              {mockMilitares.map(m => (
                <option key={m.id} value={m.id}>{POSTO_LABELS[m.posto]} {m.nomeGuerra} (RE: {m.re})</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Afastamento</label>
            <select 
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5"
            >
              <option value="">Selecione o tipo...</option>
              {TIPOS_AFASTAMENTO.map(t => (
                <option key={t.id} value={t.id}>{t.inciso} - {t.label}</option>
              ))}
            </select>
          </div>

          {selectedTipo && !selectedTipo.contaEfetivoExercicio && (
            <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-in fade-in zoom-in-95 duration-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-800">Atenção: Impacto na Carreira</h4>
                <p className="text-sm text-red-700 mt-1">
                  Este tipo de licença (<strong>{selectedTipo.label}</strong>) NÃO conta como efetivo exercício para fins de aposentadoria, promoção e tempo de serviço, conforme Art. 1º, Parágrafo único da I-36-PM.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Data Fim</label>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="indeterminado" 
                  checked={indeterminado}
                  onChange={(e) => setIndeterminado(e.target.checked)}
                  className="rounded border-gray-300 text-p1 focus:ring-p1 mr-2"
                />
                <label htmlFor="indeterminado" className="text-xs text-gray-600 cursor-pointer">Prazo Indeterminado</label>
              </div>
            </div>
            <input 
              type="date" 
              disabled={indeterminado}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-p1 focus:border-p1 border p-2.5 disabled:bg-gray-100 disabled:text-gray-400" 
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Documento</label>
            <textarea 
              value={obs}
              onChange={handleObsChange}
              className={`w-full border rounded-lg shadow-sm focus:ring-p1 focus:border-p1 p-2.5 ${obsWarning ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-300'}`} 
              rows={3} 
              placeholder="Ex: Publicado em Bol Int nº..."
            />
            {obsWarning ? (
              <p className="mt-1 text-xs text-yellow-700 font-bold">{obsWarning}</p>
            ) : (
              <div className="flex items-center mt-2 text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                <ShieldAlert className="w-4 h-4 mr-2 text-yellow-600" />
                <span>SIGILO MÉDICO: Não inserir CID, diagnósticos ou detalhes clínicos neste campo.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button onClick={() => setView('LIST')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center shadow-sm transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Salvar Afastamento
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração de Pessoal (P/1)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão Integral de Efetivo, Restrições e Afastamentos (v3.0)</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <FileDown className="w-4 h-4 mr-2" />
            Relatório
          </button>
          {view === 'LIST' && (
            <>
              <button 
                onClick={() => setView('FORM_RESTRICAO')}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Nova Restrição
              </button>
              <button 
                onClick={() => setView('FORM_AFASTAMENTO')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Afastamento
              </button>
            </>
          )}
        </div>
      </div>

      {view === 'LIST' ? (
        <>
          {/* Dashboard Stats */}
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

          {/* Charts & Alerts Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Chart */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-gray-700 mb-4 w-full text-left">Distribuição por Status</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
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

             {/* Alerts */}
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                  <ShieldAlert className="w-5 h-5 text-gray-500 mr-2" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Alertas e Pendências</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-48 overflow-y-auto">
                   {(alerts.expirations.length === 0 && alerts.criticals.length === 0) ? (
                     <div className="col-span-2 flex flex-col items-center justify-center text-gray-400">
                       <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                       <p>Nenhum alerta pendente</p>
                     </div>
                   ) : (
                     <>
                       {alerts.criticals.map((alert, idx) => (
                         <div key={`crit-${idx}`} className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                           <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                           <div>
                             <p className="text-sm font-bold text-gray-900">{POSTO_LABELS[alert.militar.posto]} {alert.militar.nomeGuerra}</p>
                             <p className="text-xs text-red-700 mt-1 font-medium">{alert.message}</p>
                           </div>
                         </div>
                       ))}
                       {alerts.expirations.map((alert, idx) => (
                         <div key={`exp-${idx}`} className="flex items-start p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                           <Clock className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                           <div>
                             <p className="text-sm font-bold text-gray-900">{POSTO_LABELS[alert.militar.posto]} {alert.militar.nomeGuerra}</p>
                             <p className="text-xs text-yellow-700 mt-1">{alert.message} ({new Date(alert.date!).toLocaleDateString('pt-BR')})</p>
                           </div>
                         </div>
                       ))}
                     </>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Buscar por nome, RE ou subunidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-p1 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500">Militar</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Lotação</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Status Operacional</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Detalhes</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Vigência/Retorno</th>
                    <th className="px-6 py-3 font-medium text-right text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMilitares.map((m) => (
                    <tr key={m.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${
                            m.status === StatusOperacional.APTO ? 'bg-green-100 text-green-700' :
                            m.status === StatusOperacional.AFASTADO ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {m.posto.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{POSTO_LABELS[m.posto]} {m.nomeGuerra}</div>
                            <div className="text-xs text-gray-500 font-mono">RE: {m.re}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{m.subunidade}</div>
                        <div className="text-xs text-gray-500">{m.pelotao}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(m.status)}
                      </td>
                      <td className="px-6 py-4">
                        {m.status === StatusOperacional.APTO_COM_RESTRICAO && m.restricoes && (
                          <div className="flex flex-wrap gap-1">
                            {m.restricoes[0].codigos.map(code => (
                              <span key={code} className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border cursor-help ${
                                ['UA', 'PO', 'DV', 'SE'].includes(code) 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`} title={CODIGOS_RESTRICAO[code]?.descricao}>
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                        {m.status === StatusOperacional.AFASTADO && m.afastamento && (
                          <div className="flex flex-col">
                            <span className="text-red-700 font-medium text-xs">
                              {TIPOS_AFASTAMENTO.find(t => t.id === m.afastamento?.tipoId)?.label || m.afastamento.tipoId}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{m.afastamento.documento}</span>
                          </div>
                        )}
                        {m.status === StatusOperacional.APTO && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                         {m.status === StatusOperacional.APTO_COM_RESTRICAO && m.restricoes && (
                           <div className="flex items-center text-orange-700">
                             <Clock className="w-3 h-3 mr-1" />
                             <span className="font-medium">{new Date(m.restricoes[0].dataFim).toLocaleDateString('pt-BR')}</span>
                           </div>
                         )}
                         {m.status === StatusOperacional.AFASTADO && m.afastamento && (
                           <div className="flex items-center text-red-700">
                             <Calendar className="w-3 h-3 mr-1" />
                             <span className="font-medium">
                               {m.afastamento.dataFim 
                                 ? new Date(m.afastamento.dataFim).toLocaleDateString('pt-BR') 
                                 : 'Indeterminado'}
                             </span>
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredMilitares.length}</span> de <span className="font-medium">{filteredMilitares.length}</span> resultados
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Anterior</button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Próximo</button>
                </nav>
              </div>
            </div>
          </div>
        </>
      ) : view === 'FORM_RESTRICAO' ? (
        <RestrictionForm />
      ) : (
        <LeaveForm />
      )}
    </div>
  );
};