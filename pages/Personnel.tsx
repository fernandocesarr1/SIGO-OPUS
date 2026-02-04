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
  CheckCircle2,
  Users,
  Building2,
  UserPlus,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye
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
import { StatusOperacional, POSTO_LABELS, PostoGraduacao } from '../types';

// =============================================
// TIPOS E INTERFACES
// =============================================

interface Policial {
  id: number;
  re: string;
  posto: PostoGraduacao;
  nomeGuerra: string;
  nomeCompleto: string;
  funcao: string;
  pelotao: string;
  subunidade: string;
  status: StatusOperacional;
  dataPromocao?: string;
  dataIngresso?: string;
  restricoes?: any[];
  afastamento?: any;
}

// =============================================
// DADOS EXPANDIDOS PARA DEMONSTRAÇÃO
// =============================================

const ORDEM_POSTO: Record<PostoGraduacao, number> = {
  'CAP': 9,
  '1TEN': 8,
  '2TEN': 7,
  'SUBTEN': 6,
  '1SGT': 5,
  '2SGT': 4,
  '3SGT': 3,
  'CB': 2,
  'SD': 1,
};

const OPM_ESTRUTURA = {
  '4ª Cia': {
    nome: '4ª Companhia - Sede Administrativa',
    subordinados: ['Estado Maior', 'P/1', 'P/2', 'P/3', 'P/4', 'P/5']
  },
  '1º Pel': {
    nome: '1º Pelotão',
    subordinados: ['BOp Campos do Jordão']
  },
  '2º Pel': {
    nome: '2º Pelotão',
    subordinados: ['BOp Cruzeiro']
  },
  '3º Pel': {
    nome: '3º Pelotão',
    subordinados: []
  }
};

// Dados mockados expandidos
const efetivo: Policial[] = [
  // 4ª Cia - Estado Maior e Seções
  { id: 1, re: "123.456-7", posto: 'CAP', nomeGuerra: "SILVA", nomeCompleto: "João Carlos da Silva Santos", funcao: "Comandante Cia", status: StatusOperacional.APTO, pelotao: "Estado Maior", subunidade: "4ª Cia", dataPromocao: "2022-03-15" },
  { id: 2, re: "111.222-3", posto: '1TEN', nomeGuerra: "OLIVEIRA", nomeCompleto: "Marcos Antonio de Oliveira Costa", funcao: "Subcomandante", status: StatusOperacional.APTO, pelotao: "Estado Maior", subunidade: "4ª Cia", dataPromocao: "2023-01-10" },
  { id: 3, re: "112.233-4", posto: '2TEN', nomeGuerra: "FERREIRA", nomeCompleto: "Carlos Eduardo Ferreira Lima", funcao: "Chefe P/1", status: StatusOperacional.APTO, pelotao: "P/1", subunidade: "4ª Cia", dataPromocao: "2024-06-01" },
  { id: 4, re: "113.244-5", posto: '2TEN', nomeGuerra: "MENDES", nomeCompleto: "Ricardo Mendes Souza", funcao: "Chefe P/3", status: StatusOperacional.APTO, pelotao: "P/3", subunidade: "4ª Cia", dataPromocao: "2024-08-15" },
  { id: 5, re: "333.444-5", posto: '1SGT', nomeGuerra: "SANTOS", nomeCompleto: "Roberto Santos Lima", funcao: "Auxiliar P/1", status: StatusOperacional.AFASTADO, pelotao: "P/1", subunidade: "4ª Cia", dataPromocao: "2020-12-01", afastamento: { tipoId: 'FERIAS', dataInicio: '2026-02-01', dataFim: '2026-03-02', documento: 'Bol Int 012/26' } },
  { id: 6, re: "334.455-6", posto: '1SGT', nomeGuerra: "PEREIRA", nomeCompleto: "Antonio Pereira Rodrigues", funcao: "Auxiliar P/3", status: StatusOperacional.APTO, pelotao: "P/3", subunidade: "4ª Cia", dataPromocao: "2021-06-15" },
  { id: 7, re: "335.466-7", posto: '2SGT', nomeGuerra: "COSTA", nomeCompleto: "Fernando Costa Ribeiro", funcao: "Auxiliar P/4", status: StatusOperacional.APTO, pelotao: "P/4", subunidade: "4ª Cia", dataPromocao: "2022-03-01" },
  { id: 8, re: "336.477-8", posto: '3SGT', nomeGuerra: "ALMEIDA", nomeCompleto: "Lucas Almeida Martins", funcao: "Motorista", status: StatusOperacional.APTO, pelotao: "P/4", subunidade: "4ª Cia", dataPromocao: "2023-09-01" },
  { id: 9, re: "337.488-9", posto: 'CB', nomeGuerra: "NASCIMENTO", nomeCompleto: "Pedro Henrique do Nascimento", funcao: "Aux. Administrativo", status: StatusOperacional.APTO, pelotao: "P/1", subunidade: "4ª Cia", dataPromocao: "2024-01-15" },
  { id: 10, re: "338.499-0", posto: 'SD', nomeGuerra: "SOUZA", nomeCompleto: "Gabriel Souza Oliveira", funcao: "Aux. Administrativo", status: StatusOperacional.APTO, pelotao: "P/5", subunidade: "4ª Cia", dataIngresso: "2024-06-01" },

  // 1º Pelotão
  { id: 11, re: "221.332-1", posto: '2TEN', nomeGuerra: "CARDOSO", nomeCompleto: "Paulo Roberto Cardoso", funcao: "Cmt 1º Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "1º Pel", dataPromocao: "2024-03-01" },
  { id: 12, re: "222.343-2", posto: '2SGT', nomeGuerra: "BARBOSA", nomeCompleto: "Marcos Barbosa Silva", funcao: "Adj Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "1º Pel", dataPromocao: "2021-12-01" },
  { id: 13, re: "223.354-3", posto: '3SGT', nomeGuerra: "MOREIRA", nomeCompleto: "José Carlos Moreira", funcao: "Chefe Equipe", status: StatusOperacional.APTO_COM_RESTRICAO, pelotao: "1ª Equipe", subunidade: "1º Pel", dataPromocao: "2022-06-01", restricoes: [{ codigos: ['EF', 'LP'], dataInicio: '2026-01-10', dataFim: '2026-04-10' }] },
  { id: 14, re: "224.365-4", posto: 'CB', nomeGuerra: "RAMOS", nomeCompleto: "Diego Ramos Santos", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "1º Pel", dataPromocao: "2023-06-01" },
  { id: 15, re: "225.376-5", posto: 'CB', nomeGuerra: "LIMA", nomeCompleto: "Rafael Lima Ferreira", funcao: "Motorista", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "1º Pel", dataPromocao: "2023-09-01" },
  { id: 16, re: "226.387-6", posto: 'SD', nomeGuerra: "TEIXEIRA", nomeCompleto: "Bruno Teixeira Costa", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "1º Pel", dataIngresso: "2023-01-15" },
  { id: 17, re: "227.398-7", posto: 'SD', nomeGuerra: "DIAS", nomeCompleto: "Felipe Dias Almeida", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "1º Pel", dataIngresso: "2023-06-01" },

  // BOp Campos do Jordão (subordinado ao 1º Pel)
  { id: 18, re: "231.409-8", posto: '3SGT', nomeGuerra: "VIEIRA", nomeCompleto: "Anderson Vieira Santos", funcao: "Cmt BOp", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "BOp Campos do Jordão", dataPromocao: "2022-09-01" },
  { id: 19, re: "232.410-9", posto: 'CB', nomeGuerra: "CUNHA", nomeCompleto: "Leonardo Cunha Silva", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Campos do Jordão", dataPromocao: "2024-03-01" },
  { id: 20, re: "233.421-0", posto: 'SD', nomeGuerra: "GOMES", nomeCompleto: "Thiago Gomes Pereira", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Campos do Jordão", dataIngresso: "2024-01-15" },

  // 2º Pelotão
  { id: 21, re: "321.532-1", posto: '2TEN', nomeGuerra: "MACHADO", nomeCompleto: "André Luis Machado", funcao: "Cmt 2º Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "2º Pel", dataPromocao: "2024-01-15" },
  { id: 22, re: "322.543-2", posto: '1SGT', nomeGuerra: "RIBEIRO", nomeCompleto: "Cláudio Ribeiro Costa", funcao: "Adj Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "2º Pel", dataPromocao: "2020-03-01" },
  { id: 23, re: "323.554-3", posto: '3SGT', nomeGuerra: "ROCHA", nomeCompleto: "Edilson Rocha Lima", funcao: "Chefe Equipe", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataPromocao: "2023-03-01" },
  { id: 24, re: "324.565-4", posto: 'CB', nomeGuerra: "FREITAS", nomeCompleto: "Marcelo Freitas Santos", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataPromocao: "2024-06-01" },
  { id: 25, re: "325.576-5", posto: 'SD', nomeGuerra: "CARVALHO", nomeCompleto: "Rodrigo Carvalho Mendes", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataIngresso: "2024-03-01" },

  // BOp Cruzeiro (subordinado ao 2º Pel)
  { id: 26, re: "331.587-6", posto: '2SGT', nomeGuerra: "NUNES", nomeCompleto: "Fábio Nunes Oliveira", funcao: "Cmt BOp", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "BOp Cruzeiro", dataPromocao: "2021-09-01" },
  { id: 27, re: "332.598-7", posto: 'CB', nomeGuerra: "PINTO", nomeCompleto: "Gustavo Pinto Almeida", funcao: "Patrulheiro", status: StatusOperacional.APTO_COM_RESTRICAO, pelotao: "Equipe", subunidade: "BOp Cruzeiro", dataPromocao: "2023-12-01", restricoes: [{ codigos: ['DV'], dataInicio: '2026-01-20', dataFim: '2026-03-20' }] },
  { id: 28, re: "333.609-8", posto: 'SD', nomeGuerra: "LOPES", nomeCompleto: "Henrique Lopes Silva", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Cruzeiro", dataIngresso: "2024-06-15" },

  // 3º Pelotão
  { id: 29, re: "421.710-9", posto: 'SUBTEN', nomeGuerra: "MONTEIRO", nomeCompleto: "Sérgio Monteiro Reis", funcao: "Cmt 3º Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "3º Pel", dataPromocao: "2019-12-01" },
  { id: 30, re: "422.721-0", posto: '2SGT', nomeGuerra: "AZEVEDO", nomeCompleto: "Márcio Azevedo Santos", funcao: "Adj Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "3º Pel", dataPromocao: "2022-06-01" },
  { id: 31, re: "423.732-1", posto: '3SGT', nomeGuerra: "XAVIER", nomeCompleto: "Paulo Xavier Costa", funcao: "Chefe Equipe", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "3º Pel", dataPromocao: "2023-06-01" },
  { id: 32, re: "424.743-2", posto: 'CB', nomeGuerra: "CAMPOS", nomeCompleto: "Daniel Campos Ferreira", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "3º Pel", dataPromocao: "2024-09-01" },
  { id: 33, re: "425.754-3", posto: 'SD', nomeGuerra: "MIRANDA", nomeCompleto: "Victor Miranda Lima", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "3º Pel", dataIngresso: "2024-09-01" },
  { id: 34, re: "426.765-4", posto: 'SD', nomeGuerra: "REIS", nomeCompleto: "Eduardo Reis Santos", funcao: "Motorista", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "3º Pel", dataIngresso: "2025-01-15" },
];

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Personnel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EFETIVO' | 'CADASTRO' | 'RESTRICOES'>('EFETIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GERAL' | 'OPM'>('GERAL');
  const [expandedOPMs, setExpandedOPMs] = useState<string[]>(['4ª Cia', '1º Pel', '2º Pel', '3º Pel']);
  const [formView, setFormView] = useState<'LIST' | 'FORM_AFASTAMENTO' | 'FORM_RESTRICAO'>('LIST');

  // =============================================
  // FUNÇÕES DE ORDENAÇÃO
  // =============================================

  const ordenarPorAntiguidade = (a: Policial, b: Policial): number => {
    // 1. Comparar por posto (maior primeiro)
    const postoA = ORDEM_POSTO[a.posto] || 0;
    const postoB = ORDEM_POSTO[b.posto] || 0;

    if (postoA !== postoB) {
      return postoB - postoA;
    }

    // 2. Se mesmo posto, comparar por data de promoção (mais antiga primeiro)
    if (a.posto !== 'SD' && b.posto !== 'SD') {
      const dataPromocaoA = a.dataPromocao ? new Date(a.dataPromocao).getTime() : Date.now();
      const dataPromocaoB = b.dataPromocao ? new Date(b.dataPromocao).getTime() : Date.now();
      return dataPromocaoA - dataPromocaoB;
    }

    // 3. Se Sd PM, comparar por data de ingresso (mais antiga primeiro)
    if (a.posto === 'SD' && b.posto === 'SD') {
      const dataIngressoA = a.dataIngresso ? new Date(a.dataIngresso).getTime() : Date.now();
      const dataIngressoB = b.dataIngresso ? new Date(b.dataIngresso).getTime() : Date.now();
      return dataIngressoA - dataIngressoB;
    }

    return 0;
  };

  // =============================================
  // DADOS FILTRADOS E ORDENADOS
  // =============================================

  const efetivoFiltrado = useMemo(() => {
    return efetivo
      .filter(m =>
        m.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.re.includes(searchTerm)
      )
      .sort(ordenarPorAntiguidade);
  }, [searchTerm]);

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

    // Ordenar cada grupo por antiguidade
    Object.keys(grupos).forEach(key => {
      grupos[key].sort(ordenarPorAntiguidade);
    });

    return grupos;
  }, [efetivoFiltrado]);

  const stats = useMemo(() => ({
    total: efetivo.length,
    aptos: efetivo.filter(m => m.status === StatusOperacional.APTO).length,
    restricao: efetivo.filter(m => m.status === StatusOperacional.APTO_COM_RESTRICAO).length,
    afastados: efetivo.filter(m => m.status === StatusOperacional.AFASTADO).length,
  }), []);

  // =============================================
  // HELPERS
  // =============================================

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

  const getOPMHierarchy = (opm: string): string => {
    if (opm === 'BOp Campos do Jordão') return '1º Pel';
    if (opm === 'BOp Cruzeiro') return '2º Pel';
    return '';
  };

  // =============================================
  // SUB-COMPONENTES
  // =============================================

  // Linha da tabela de efetivo
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
          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Visualizar">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Editar">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  // Tabela geral por antiguidade
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
            {efetivoFiltrado.map((m, index) => (
              <EfetivoRow key={m.id} m={m} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total: <span className="font-bold">{efetivoFiltrado.length}</span> policiais militares
          {searchTerm && ` (filtrado de ${efetivo.length})`}
        </p>
      </div>
    </div>
  );

  // Tabela agrupada por OPM
  const TabelaAgrupada = () => {
    const renderGrupo = (opm: string, policiais: Policial[], nivel: number = 0) => {
      const isExpanded = expandedOPMs.includes(opm);
      const hierarchy = getOPMHierarchy(opm);
      const isSubordinado = nivel > 0 || hierarchy !== '';

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
                          <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
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
          {/* 4ª Cia */}
          {renderGrupo('4ª Cia', efetivoAgrupado['4ª Cia'])}

          {/* 1º Pel e subordinados */}
          {renderGrupo('1º Pel', efetivoAgrupado['1º Pel'])}
          {expandedOPMs.includes('1º Pel') && renderGrupo('BOp Campos do Jordão', efetivoAgrupado['BOp Campos do Jordão'], 1)}

          {/* 2º Pel e subordinados */}
          {renderGrupo('2º Pel', efetivoAgrupado['2º Pel'])}
          {expandedOPMs.includes('2º Pel') && renderGrupo('BOp Cruzeiro', efetivoAgrupado['BOp Cruzeiro'], 1)}

          {/* 3º Pel */}
          {renderGrupo('3º Pel', efetivoAgrupado['3º Pel'])}
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Geral: <span className="font-bold">{efetivo.length}</span> policiais militares
          </p>
        </div>
      </div>
    );
  };

  // Formulário de Cadastro
  const FormularioCadastro = () => {
    const [formData, setFormData] = useState({
      re: '',
      nome: '',
      nomeGuerra: '',
      posto: '',
      opm: '',
      funcao: '',
      dataPromocao: '',
      dataIngresso: '',
      email: '',
      telefone: ''
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
          <UserPlus className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Policial</h2>
            <p className="text-sm text-gray-500">Preencha os dados para incluir um novo PM no efetivo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RE (Registro Estatístico) *</label>
            <input
              type="text"
              placeholder="Ex: 123.456-7"
              value={formData.re}
              onChange={(e) => setFormData({...formData, re: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posto/Graduação *</label>
            <select
              value={formData.posto}
              onChange={(e) => setFormData({...formData, posto: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione...</option>
              <option value="CAP">Cap PM</option>
              <option value="1TEN">1º Ten PM</option>
              <option value="2TEN">2º Ten PM</option>
              <option value="SUBTEN">Subten PM</option>
              <option value="1SGT">1º Sgt PM</option>
              <option value="2SGT">2º Sgt PM</option>
              <option value="3SGT">3º Sgt PM</option>
              <option value="CB">Cb PM</option>
              <option value="SD">Sd PM</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              placeholder="Nome completo do policial"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Guerra *</label>
            <input
              type="text"
              placeholder="Ex: SILVA"
              value={formData.nomeGuerra}
              onChange={(e) => setFormData({...formData, nomeGuerra: e.target.value.toUpperCase()})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OPM (Unidade) *</label>
            <select
              value={formData.opm}
              onChange={(e) => setFormData({...formData, opm: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione...</option>
              <option value="4ª Cia">4ª Cia (Sede Administrativa)</option>
              <option value="1º Pel">1º Pelotão</option>
              <option value="BOp Campos do Jordão">BOp Campos do Jordão</option>
              <option value="2º Pel">2º Pelotão</option>
              <option value="BOp Cruzeiro">BOp Cruzeiro</option>
              <option value="3º Pel">3º Pelotão</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <input
              type="text"
              placeholder="Ex: Patrulheiro, Motorista..."
              value={formData.funcao}
              onChange={(e) => setFormData({...formData, funcao: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.posto === 'SD' ? 'Data de Ingresso' : 'Data de Promoção'}
            </label>
            <input
              type="date"
              value={formData.posto === 'SD' ? formData.dataIngresso : formData.dataPromocao}
              onChange={(e) => formData.posto === 'SD'
                ? setFormData({...formData, dataIngresso: e.target.value})
                : setFormData({...formData, dataPromocao: e.target.value})
              }
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Usado para ordenação por antiguidade</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="email@pm.sp.gov.br"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              placeholder="(12) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">* Campos obrigatórios</p>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ re: '', nome: '', nomeGuerra: '', posto: '', opm: '', funcao: '', dataPromocao: '', dataIngresso: '', email: '', telefone: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Salvar Policial
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Conteúdo da aba de Restrições (código existente simplificado)
  const RestricoesContent = () => {
    const chartData = [
      { name: 'Aptos', value: stats.aptos, color: '#10b981' },
      { name: 'Com Restrição', value: stats.restricao, color: '#f59e0b' },
      { name: 'Afastados', value: stats.afastados, color: '#ef4444' },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
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

        {/* Chart and Actions */}
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
                onClick={() => setFormView('FORM_RESTRICAO')}
                className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-orange-900">Nova Restrição Médica</p>
                  <p className="text-xs text-orange-700">40 códigos conforme BG PM 166/06</p>
                </div>
              </button>
              <button
                onClick={() => setFormView('FORM_AFASTAMENTO')}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {efetivo.filter(m => m.status !== StatusOperacional.APTO).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{POSTO_LABELS[m.posto]} {m.nomeGuerra}</div>
                      <div className="text-xs text-gray-500">RE: {m.re}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.subunidade}</td>
                    <td className="px-4 py-3">{getStatusBadge(m.status)}</td>
                    <td className="px-4 py-3">
                      {m.restricoes && (
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
                      {m.restricoes && (
                        <span className="text-orange-700">{new Date(m.restricoes[0].dataFim).toLocaleDateString('pt-BR')}</span>
                      )}
                      {m.afastamento && (
                        <span className="text-red-700">
                          {m.afastamento.dataFim ? new Date(m.afastamento.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração de Pessoal (P/1)</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Efetivo da 4ª Companhia - 3º BPAmb</p>
        </div>
        <div className="flex gap-2">
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
            </div>
          </div>

          {/* Tabelas */}
          {viewMode === 'GERAL' ? <TabelaGeral /> : <TabelaAgrupada />}
        </div>
      )}

      {activeTab === 'CADASTRO' && <FormularioCadastro />}

      {activeTab === 'RESTRICOES' && <RestricoesContent />}
    </div>
  );
};
