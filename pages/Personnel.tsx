import React, { useState, useMemo, useEffect } from 'react';
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
  Eye,
  FileText,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Award,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  History,
  GraduationCap,
  Medal,
  HeartPulse,
  Plane,
  BookOpen,
  Scale,
  Shield,
  Star,
  Printer,
  ChevronLeft,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CODIGOS_RESTRICAO, TIPOS_AFASTAMENTO } from '../data';
import { StatusOperacional, POSTO_LABELS, PostoGraduacao } from '../types';
import { usePoliciais, useSubunidades, useAfastamentos, useRestricoes } from '../hooks/usePoliciais';
import { useDashboardEfetivo } from '../hooks/useDashboard';

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
  dataNascimento?: string;
  cpf?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  restricoes?: RestricaoHistorico[];
  afastamento?: AfastamentoHistorico;
  historicoAfastamentos?: AfastamentoHistorico[];
  historicoRestricoes?: RestricaoHistorico[];
  historicoPromocoes?: PromocaoHistorico[];
  historicoMovimentacoes?: MovimentacaoHistorico[];
  historicoElogios?: ElogioHistorico[];
  historicoPunicoes?: PunicaoHistorico[];
  historicoCursos?: CursoHistorico[];
}

interface RestricaoHistorico {
  id: number;
  codigos: string[];
  parecer: string;
  dataInicio: string;
  dataFim: string;
  documento: string;
  status: 'ATIVO' | 'ENCERRADO';
}

interface AfastamentoHistorico {
  id: number;
  tipoId: string;
  dataInicio: string;
  dataFim: string | null;
  documento: string;
  motivo?: string;
  status: 'ATIVO' | 'ENCERRADO';
}

interface PromocaoHistorico {
  id: number;
  postoAnterior: PostoGraduacao;
  postoNovo: PostoGraduacao;
  data: string;
  documento: string;
  tipo: 'ANTIGUIDADE' | 'MERECIMENTO' | 'BRAVURA' | 'POST_MORTEM';
}

interface MovimentacaoHistorico {
  id: number;
  opmOrigem: string;
  opmDestino: string;
  data: string;
  documento: string;
  tipo: 'TRANSFERENCIA' | 'CLASSIFICACAO' | 'RECLASSIFICACAO' | 'ADIDAMENTO';
}

interface ElogioHistorico {
  id: number;
  tipo: 'INDIVIDUAL' | 'COLETIVO';
  motivo: string;
  data: string;
  documento: string;
  autoridade: string;
}

interface PunicaoHistorico {
  id: number;
  tipo: 'ADVERTENCIA' | 'REPREENSAO' | 'DETENCAO' | 'PRISAO';
  motivo: string;
  data: string;
  documento: string;
  diasPunicao?: number;
  cancelada?: boolean;
}

interface CursoHistorico {
  id: number;
  nome: string;
  instituicao: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  situacao: 'APROVADO' | 'REPROVADO' | 'EM_ANDAMENTO' | 'DESISTENTE';
  documento?: string;
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

// Dados mockados expandidos com histórico completo
const efetivo: Policial[] = [
  // 4ª Cia - Estado Maior e Seções
  {
    id: 1,
    re: "123.456-7",
    posto: 'CAP',
    nomeGuerra: "SILVA",
    nomeCompleto: "João Carlos da Silva Santos",
    funcao: "Comandante Cia",
    status: StatusOperacional.APTO,
    pelotao: "Estado Maior",
    subunidade: "4ª Cia",
    dataPromocao: "2022-03-15",
    dataIngresso: "2002-01-15",
    dataNascimento: "1978-05-20",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    email: "jc.silva@policiamilitar.sp.gov.br",
    telefone: "(12) 99999-1234",
    endereco: "Rua das Flores, 123 - Centro - São José dos Campos/SP",
    historicoPromocoes: [
      { id: 1, postoAnterior: '1TEN', postoNovo: 'CAP', data: '2022-03-15', documento: 'DOE 045/22', tipo: 'ANTIGUIDADE' },
      { id: 2, postoAnterior: '2TEN', postoNovo: '1TEN', data: '2017-06-01', documento: 'DOE 102/17', tipo: 'MERECIMENTO' },
      { id: 3, postoAnterior: 'SUBTEN', postoNovo: '2TEN', data: '2012-12-01', documento: 'DOE 221/12', tipo: 'ANTIGUIDADE' },
    ],
    historicoMovimentacoes: [
      { id: 1, opmOrigem: '3º BPAmb - Sede', opmDestino: '4ª Cia/3º BPAmb', data: '2023-01-15', documento: 'Bol G PM 012/23', tipo: 'CLASSIFICACAO' },
      { id: 2, opmOrigem: '2º BPAmb', opmDestino: '3º BPAmb - Sede', data: '2018-03-01', documento: 'Bol G PM 034/18', tipo: 'TRANSFERENCIA' },
    ],
    historicoElogios: [
      { id: 1, tipo: 'INDIVIDUAL', motivo: 'Atuação destacada em operação de fiscalização ambiental', data: '2024-08-15', documento: 'Bol Int 156/24', autoridade: 'Comandante 3º BPAmb' },
      { id: 2, tipo: 'COLETIVO', motivo: 'Participação na Operação Mata Atlântica 2023', data: '2023-11-20', documento: 'Bol G PM 198/23', autoridade: 'Cmt CPAMB' },
    ],
    historicoCursos: [
      { id: 1, nome: 'Curso de Aperfeiçoamento de Oficiais (CAO)', instituicao: 'APMBB', cargaHoraria: 1200, dataInicio: '2020-02-01', dataFim: '2020-12-15', situacao: 'APROVADO', documento: 'Bol G PM 245/20' },
      { id: 2, nome: 'Curso de Crimes Ambientais', instituicao: 'Academia de Polícia', cargaHoraria: 80, dataInicio: '2019-05-10', dataFim: '2019-05-24', situacao: 'APROVADO' },
    ],
    historicoRestricoes: [
      { id: 1, codigos: ['LP'], parecer: 'Recuperação pós-cirúrgica', dataInicio: '2021-03-01', dataFim: '2021-04-30', documento: 'JMSU 234/21', status: 'ENCERRADO' },
    ],
    historicoAfastamentos: [
      { id: 1, tipoId: 'LTS', dataInicio: '2021-02-15', dataFim: '2021-02-28', documento: 'Bol Int 025/21', motivo: 'Procedimento cirúrgico', status: 'ENCERRADO' },
    ],
  },
  {
    id: 2,
    re: "111.222-3",
    posto: '1TEN',
    nomeGuerra: "OLIVEIRA",
    nomeCompleto: "Marcos Antonio de Oliveira Costa",
    funcao: "Subcomandante",
    status: StatusOperacional.APTO,
    pelotao: "Estado Maior",
    subunidade: "4ª Cia",
    dataPromocao: "2023-01-10",
    dataIngresso: "2005-06-01",
    dataNascimento: "1982-11-08",
    cpf: "234.567.890-11",
    email: "ma.oliveira@policiamilitar.sp.gov.br",
    telefone: "(12) 98888-5678",
    historicoPromocoes: [
      { id: 1, postoAnterior: '2TEN', postoNovo: '1TEN', data: '2023-01-10', documento: 'DOE 008/23', tipo: 'ANTIGUIDADE' },
    ],
    historicoElogios: [
      { id: 1, tipo: 'INDIVIDUAL', motivo: 'Coordenação eficiente de operação integrada', data: '2024-05-20', documento: 'Bol Int 089/24', autoridade: 'Comandante 4ª Cia' },
    ],
    historicoCursos: [
      { id: 1, nome: 'Curso de Operações Ambientais', instituicao: 'CPAMB', cargaHoraria: 160, dataInicio: '2022-08-01', dataFim: '2022-08-30', situacao: 'APROVADO' },
    ],
  },
  {
    id: 3,
    re: "112.233-4",
    posto: '2TEN',
    nomeGuerra: "FERREIRA",
    nomeCompleto: "Carlos Eduardo Ferreira Lima",
    funcao: "Chefe P/1",
    status: StatusOperacional.APTO,
    pelotao: "P/1",
    subunidade: "4ª Cia",
    dataPromocao: "2024-06-01",
    dataIngresso: "2008-01-15",
    historicoPromocoes: [
      { id: 1, postoAnterior: 'SUBTEN', postoNovo: '2TEN', data: '2024-06-01', documento: 'DOE 101/24', tipo: 'MERECIMENTO' },
    ],
  },
  {
    id: 4,
    re: "113.244-5",
    posto: '2TEN',
    nomeGuerra: "MENDES",
    nomeCompleto: "Ricardo Mendes Souza",
    funcao: "Chefe P/3",
    status: StatusOperacional.APTO,
    pelotao: "P/3",
    subunidade: "4ª Cia",
    dataPromocao: "2024-08-15",
    dataIngresso: "2008-03-01",
  },
  {
    id: 5,
    re: "333.444-5",
    posto: '1SGT',
    nomeGuerra: "SANTOS",
    nomeCompleto: "Roberto Santos Lima",
    funcao: "Auxiliar P/1",
    status: StatusOperacional.AFASTADO,
    pelotao: "P/1",
    subunidade: "4ª Cia",
    dataPromocao: "2020-12-01",
    dataIngresso: "2000-07-01",
    dataNascimento: "1975-03-12",
    cpf: "345.678.901-22",
    email: "r.santos@policiamilitar.sp.gov.br",
    telefone: "(12) 97777-3456",
    afastamento: {
      id: 1,
      tipoId: 'FERIAS',
      dataInicio: '2026-02-01',
      dataFim: '2026-03-02',
      documento: 'Bol Int 012/26',
      status: 'ATIVO'
    },
    historicoAfastamentos: [
      { id: 1, tipoId: 'FERIAS', dataInicio: '2026-02-01', dataFim: '2026-03-02', documento: 'Bol Int 012/26', status: 'ATIVO' },
      { id: 2, tipoId: 'FERIAS', dataInicio: '2025-02-01', dataFim: '2025-03-02', documento: 'Bol Int 015/25', status: 'ENCERRADO' },
      { id: 3, tipoId: 'LTS', dataInicio: '2024-08-10', dataFim: '2024-08-25', documento: 'Bol Int 145/24', motivo: 'Tratamento de saúde', status: 'ENCERRADO' },
    ],
    historicoPromocoes: [
      { id: 1, postoAnterior: '2SGT', postoNovo: '1SGT', data: '2020-12-01', documento: 'DOE 232/20', tipo: 'ANTIGUIDADE' },
      { id: 2, postoAnterior: '3SGT', postoNovo: '2SGT', data: '2015-06-01', documento: 'DOE 105/15', tipo: 'ANTIGUIDADE' },
    ],
    historicoElogios: [
      { id: 1, tipo: 'INDIVIDUAL', motivo: 'Dedicação exemplar nas atividades administrativas', data: '2023-12-15', documento: 'Bol Int 234/23', autoridade: 'Chefe P/1' },
    ],
    historicoCursos: [
      { id: 1, nome: 'Curso de Sargentos (CFS)', instituicao: 'ESSgt', cargaHoraria: 2400, dataInicio: '2008-02-01', dataFim: '2008-12-15', situacao: 'APROVADO' },
      { id: 2, nome: 'Curso de Gestão de Pessoal', instituicao: 'DP', cargaHoraria: 40, dataInicio: '2022-06-01', dataFim: '2022-06-05', situacao: 'APROVADO' },
    ],
  },
  {
    id: 6,
    re: "334.455-6",
    posto: '1SGT',
    nomeGuerra: "PEREIRA",
    nomeCompleto: "Antonio Pereira Rodrigues",
    funcao: "Auxiliar P/3",
    status: StatusOperacional.APTO,
    pelotao: "P/3",
    subunidade: "4ª Cia",
    dataPromocao: "2021-06-15",
    dataIngresso: "2001-01-15",
  },
  {
    id: 7,
    re: "335.466-7",
    posto: '2SGT',
    nomeGuerra: "COSTA",
    nomeCompleto: "Fernando Costa Ribeiro",
    funcao: "Auxiliar P/4",
    status: StatusOperacional.APTO,
    pelotao: "P/4",
    subunidade: "4ª Cia",
    dataPromocao: "2022-03-01",
    dataIngresso: "2003-07-01",
  },
  {
    id: 8,
    re: "336.477-8",
    posto: '3SGT',
    nomeGuerra: "ALMEIDA",
    nomeCompleto: "Lucas Almeida Martins",
    funcao: "Motorista",
    status: StatusOperacional.APTO,
    pelotao: "P/4",
    subunidade: "4ª Cia",
    dataPromocao: "2023-09-01",
    dataIngresso: "2010-01-15",
  },
  {
    id: 9,
    re: "337.488-9",
    posto: 'CB',
    nomeGuerra: "NASCIMENTO",
    nomeCompleto: "Pedro Henrique do Nascimento",
    funcao: "Aux. Administrativo",
    status: StatusOperacional.APTO,
    pelotao: "P/1",
    subunidade: "4ª Cia",
    dataPromocao: "2024-01-15",
    dataIngresso: "2018-06-01",
  },
  {
    id: 10,
    re: "338.499-0",
    posto: 'SD',
    nomeGuerra: "SOUZA",
    nomeCompleto: "Gabriel Souza Oliveira",
    funcao: "Aux. Administrativo",
    status: StatusOperacional.APTO,
    pelotao: "P/5",
    subunidade: "4ª Cia",
    dataIngresso: "2024-06-01",
  },

  // 1º Pelotão
  {
    id: 11,
    re: "221.332-1",
    posto: '2TEN',
    nomeGuerra: "CARDOSO",
    nomeCompleto: "Paulo Roberto Cardoso",
    funcao: "Cmt 1º Pel",
    status: StatusOperacional.APTO,
    pelotao: "Comando",
    subunidade: "1º Pel",
    dataPromocao: "2024-03-01",
    dataIngresso: "2009-01-15",
  },
  {
    id: 12,
    re: "222.343-2",
    posto: '2SGT',
    nomeGuerra: "BARBOSA",
    nomeCompleto: "Marcos Barbosa Silva",
    funcao: "Adj Pel",
    status: StatusOperacional.APTO,
    pelotao: "Comando",
    subunidade: "1º Pel",
    dataPromocao: "2021-12-01",
    dataIngresso: "2005-07-01",
  },
  {
    id: 13,
    re: "223.354-3",
    posto: '3SGT',
    nomeGuerra: "MOREIRA",
    nomeCompleto: "José Carlos Moreira",
    funcao: "Chefe Equipe",
    status: StatusOperacional.APTO_COM_RESTRICAO,
    pelotao: "1ª Equipe",
    subunidade: "1º Pel",
    dataPromocao: "2022-06-01",
    dataIngresso: "2008-01-15",
    dataNascimento: "1985-07-22",
    cpf: "456.789.012-33",
    email: "jc.moreira@policiamilitar.sp.gov.br",
    telefone: "(12) 96666-7890",
    restricoes: [{
      id: 1,
      codigos: ['EF', 'LP'],
      parecer: 'Recuperação de lesão no joelho direito',
      dataInicio: '2026-01-10',
      dataFim: '2026-04-10',
      documento: 'JMSU 015/26',
      status: 'ATIVO'
    }],
    historicoRestricoes: [
      { id: 1, codigos: ['EF', 'LP'], parecer: 'Recuperação de lesão no joelho direito', dataInicio: '2026-01-10', dataFim: '2026-04-10', documento: 'JMSU 015/26', status: 'ATIVO' },
      { id: 2, codigos: ['LP'], parecer: 'Pós-operatório', dataInicio: '2023-05-01', dataFim: '2023-07-01', documento: 'JMSU 089/23', status: 'ENCERRADO' },
    ],
    historicoAfastamentos: [
      { id: 1, tipoId: 'LTS', dataInicio: '2023-04-15', dataFim: '2023-04-30', documento: 'Bol Int 067/23', motivo: 'Cirurgia no joelho', status: 'ENCERRADO' },
    ],
    historicoPunicoes: [
      { id: 1, tipo: 'ADVERTENCIA', motivo: 'Atraso em serviço', data: '2020-03-15', documento: 'Bol Int 045/20' },
    ],
  },
  { id: 14, re: "224.365-4", posto: 'CB', nomeGuerra: "RAMOS", nomeCompleto: "Diego Ramos Santos", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "1º Pel", dataPromocao: "2023-06-01", dataIngresso: "2015-01-15" },
  { id: 15, re: "225.376-5", posto: 'CB', nomeGuerra: "LIMA", nomeCompleto: "Rafael Lima Ferreira", funcao: "Motorista", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "1º Pel", dataPromocao: "2023-09-01", dataIngresso: "2016-06-01" },
  { id: 16, re: "226.387-6", posto: 'SD', nomeGuerra: "TEIXEIRA", nomeCompleto: "Bruno Teixeira Costa", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "1º Pel", dataIngresso: "2023-01-15" },
  { id: 17, re: "227.398-7", posto: 'SD', nomeGuerra: "DIAS", nomeCompleto: "Felipe Dias Almeida", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "1º Pel", dataIngresso: "2023-06-01" },

  // BOp Campos do Jordão (subordinado ao 1º Pel)
  { id: 18, re: "231.409-8", posto: '3SGT', nomeGuerra: "VIEIRA", nomeCompleto: "Anderson Vieira Santos", funcao: "Cmt BOp", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "BOp Campos do Jordão", dataPromocao: "2022-09-01", dataIngresso: "2007-07-01" },
  { id: 19, re: "232.410-9", posto: 'CB', nomeGuerra: "CUNHA", nomeCompleto: "Leonardo Cunha Silva", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Campos do Jordão", dataPromocao: "2024-03-01", dataIngresso: "2017-01-15" },
  { id: 20, re: "233.421-0", posto: 'SD', nomeGuerra: "GOMES", nomeCompleto: "Thiago Gomes Pereira", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Campos do Jordão", dataIngresso: "2024-01-15" },

  // 2º Pelotão
  { id: 21, re: "321.532-1", posto: '2TEN', nomeGuerra: "MACHADO", nomeCompleto: "André Luis Machado", funcao: "Cmt 2º Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "2º Pel", dataPromocao: "2024-01-15", dataIngresso: "2009-07-01" },
  { id: 22, re: "322.543-2", posto: '1SGT', nomeGuerra: "RIBEIRO", nomeCompleto: "Cláudio Ribeiro Costa", funcao: "Adj Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "2º Pel", dataPromocao: "2020-03-01", dataIngresso: "2000-01-15" },
  { id: 23, re: "323.554-3", posto: '3SGT', nomeGuerra: "ROCHA", nomeCompleto: "Edilson Rocha Lima", funcao: "Chefe Equipe", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataPromocao: "2023-03-01", dataIngresso: "2010-07-01" },
  { id: 24, re: "324.565-4", posto: 'CB', nomeGuerra: "FREITAS", nomeCompleto: "Marcelo Freitas Santos", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataPromocao: "2024-06-01", dataIngresso: "2018-01-15" },
  { id: 25, re: "325.576-5", posto: 'SD', nomeGuerra: "CARVALHO", nomeCompleto: "Rodrigo Carvalho Mendes", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "2º Pel", dataIngresso: "2024-03-01" },

  // BOp Cruzeiro (subordinado ao 2º Pel)
  { id: 26, re: "331.587-6", posto: '2SGT', nomeGuerra: "NUNES", nomeCompleto: "Fábio Nunes Oliveira", funcao: "Cmt BOp", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "BOp Cruzeiro", dataPromocao: "2021-09-01", dataIngresso: "2004-07-01" },
  {
    id: 27,
    re: "332.598-7",
    posto: 'CB',
    nomeGuerra: "PINTO",
    nomeCompleto: "Gustavo Pinto Almeida",
    funcao: "Patrulheiro",
    status: StatusOperacional.APTO_COM_RESTRICAO,
    pelotao: "Equipe",
    subunidade: "BOp Cruzeiro",
    dataPromocao: "2023-12-01",
    dataIngresso: "2016-01-15",
    restricoes: [{
      id: 1,
      codigos: ['DV'],
      parecer: 'Restrição visual temporária - aguardando cirurgia',
      dataInicio: '2026-01-20',
      dataFim: '2026-03-20',
      documento: 'JMSU 022/26',
      status: 'ATIVO'
    }],
    historicoRestricoes: [
      { id: 1, codigos: ['DV'], parecer: 'Restrição visual temporária - aguardando cirurgia', dataInicio: '2026-01-20', dataFim: '2026-03-20', documento: 'JMSU 022/26', status: 'ATIVO' },
    ],
  },
  { id: 28, re: "333.609-8", posto: 'SD', nomeGuerra: "LOPES", nomeCompleto: "Henrique Lopes Silva", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "Equipe", subunidade: "BOp Cruzeiro", dataIngresso: "2024-06-15" },

  // 3º Pelotão
  { id: 29, re: "421.710-9", posto: 'SUBTEN', nomeGuerra: "MONTEIRO", nomeCompleto: "Sérgio Monteiro Reis", funcao: "Cmt 3º Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "3º Pel", dataPromocao: "2019-12-01", dataIngresso: "1998-07-01" },
  { id: 30, re: "422.721-0", posto: '2SGT', nomeGuerra: "AZEVEDO", nomeCompleto: "Márcio Azevedo Santos", funcao: "Adj Pel", status: StatusOperacional.APTO, pelotao: "Comando", subunidade: "3º Pel", dataPromocao: "2022-06-01", dataIngresso: "2006-01-15" },
  { id: 31, re: "423.732-1", posto: '3SGT', nomeGuerra: "XAVIER", nomeCompleto: "Paulo Xavier Costa", funcao: "Chefe Equipe", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "3º Pel", dataPromocao: "2023-06-01", dataIngresso: "2011-07-01" },
  { id: 32, re: "424.743-2", posto: 'CB', nomeGuerra: "CAMPOS", nomeCompleto: "Daniel Campos Ferreira", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "1ª Equipe", subunidade: "3º Pel", dataPromocao: "2024-09-01", dataIngresso: "2019-01-15" },
  { id: 33, re: "425.754-3", posto: 'SD', nomeGuerra: "MIRANDA", nomeCompleto: "Victor Miranda Lima", funcao: "Patrulheiro", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "3º Pel", dataIngresso: "2024-09-01" },
  { id: 34, re: "426.765-4", posto: 'SD', nomeGuerra: "REIS", nomeCompleto: "Eduardo Reis Santos", funcao: "Motorista", status: StatusOperacional.APTO, pelotao: "2ª Equipe", subunidade: "3º Pel", dataIngresso: "2025-01-15" },
];

// =============================================
// COMPONENTE FICHA INDIVIDUAL
// =============================================

interface FichaIndividualProps {
  policial: Policial;
  onClose: () => void;
}

const FichaIndividual: React.FC<FichaIndividualProps> = ({ policial, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('DADOS_PESSOAIS');

  const sections = [
    { id: 'DADOS_PESSOAIS', label: 'Dados Pessoais', icon: FileText },
    { id: 'CARREIRA', label: 'Carreira', icon: TrendingUp },
    { id: 'PROMOCOES', label: 'Promoções', icon: Medal },
    { id: 'MOVIMENTACOES', label: 'Movimentações', icon: MapPin },
    { id: 'RESTRICOES', label: 'Restrições Médicas', icon: HeartPulse },
    { id: 'AFASTAMENTOS', label: 'Afastamentos', icon: Plane },
    { id: 'CURSOS', label: 'Cursos', icon: GraduationCap },
    { id: 'ELOGIOS', label: 'Elogios', icon: Award },
    { id: 'PUNICOES', label: 'Punições', icon: Scale },
  ];

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: StatusOperacional) => {
    switch (status) {
      case StatusOperacional.APTO:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-4 h-4 mr-1.5" /> APTO</span>;
      case StatusOperacional.APTO_COM_RESTRICAO:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-4 h-4 mr-1.5" /> COM RESTRIÇÃO</span>;
      case StatusOperacional.AFASTADO:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><XCircle className="w-4 h-4 mr-1.5" /> AFASTADO</span>;
    }
  };

  const calcularTempoServico = () => {
    if (!policial.dataIngresso) return '-';
    const ingresso = new Date(policial.dataIngresso);
    const hoje = new Date();
    const anos = Math.floor((hoje.getTime() - ingresso.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const meses = Math.floor(((hoje.getTime() - ingresso.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    return `${anos} anos e ${meses} meses`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'DADOS_PESSOAIS':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Identificação</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Nome Completo</label>
                    <p className="font-medium text-gray-900">{policial.nomeCompleto}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Nome de Guerra</label>
                    <p className="font-medium text-gray-900">{policial.nomeGuerra}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">RE</label>
                    <p className="font-mono font-medium text-gray-900">{policial.re}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">CPF</label>
                    <p className="font-mono text-gray-900">{policial.cpf || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">RG</label>
                    <p className="font-mono text-gray-900">{policial.rg || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Data de Nascimento</label>
                    <p className="text-gray-900">{formatDate(policial.dataNascimento)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Contato</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{policial.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{policial.telefone || 'Não informado'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-900">{policial.endereco || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'CARREIRA':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Posto/Graduação</span>
                </div>
                <p className="text-2xl font-bold text-primary-900">{POSTO_LABELS[policial.posto]}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Data de Ingresso</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{formatDate(policial.dataIngresso)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Tempo de Serviço</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{calcularTempoServico()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Lotação Atual</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">OPM</label>
                    <p className="font-medium text-gray-900">{policial.subunidade}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Seção/Pelotão</label>
                    <p className="text-gray-900">{policial.pelotao}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Função</label>
                    <p className="text-gray-900">{policial.funcao}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Situação Operacional</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Status</label>
                    <div className="mt-1">{getStatusBadge(policial.status)}</div>
                  </div>
                  {policial.dataPromocao && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Última Promoção</label>
                      <p className="text-gray-900">{formatDate(policial.dataPromocao)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'PROMOCOES':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Histórico de Promoções</h4>
              <span className="text-sm text-gray-500">
                Total: {policial.historicoPromocoes?.length || 0} promoção(ões)
              </span>
            </div>

            {policial.historicoPromocoes && policial.historicoPromocoes.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200"></div>
                <div className="space-y-4">
                  {policial.historicoPromocoes.map((promo, index) => (
                    <div key={promo.id} className="relative pl-10">
                      <div className="absolute left-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{POSTO_LABELS[promo.postoAnterior]}</span>
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-primary-700">{POSTO_LABELS[promo.postoNovo]}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            promo.tipo === 'MERECIMENTO' ? 'bg-yellow-100 text-yellow-800' :
                            promo.tipo === 'BRAVURA' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {promo.tipo}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{formatDate(promo.data)}</span>
                          <span className="mx-2">•</span>
                          <span>{promo.documento}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Medal className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma promoção registrada</p>
              </div>
            )}
          </div>
        );

      case 'MOVIMENTACOES':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Histórico de Movimentações</h4>
              <span className="text-sm text-gray-500">
                Total: {policial.historicoMovimentacoes?.length || 0} movimentação(ões)
              </span>
            </div>

            {policial.historicoMovimentacoes && policial.historicoMovimentacoes.length > 0 ? (
              <div className="space-y-3">
                {policial.historicoMovimentacoes.map((mov) => (
                  <div key={mov.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        mov.tipo === 'TRANSFERENCIA' ? 'bg-blue-100 text-blue-800' :
                        mov.tipo === 'CLASSIFICACAO' ? 'bg-green-100 text-green-800' :
                        mov.tipo === 'ADIDAMENTO' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {mov.tipo}
                      </span>
                      <span className="text-sm text-gray-600">{formatDate(mov.data)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{mov.opmOrigem}</span>
                      <ArrowUpRight className="w-4 h-4 text-primary-600 rotate-45" />
                      <span className="font-medium text-gray-900">{mov.opmDestino}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{mov.documento}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        );

      case 'RESTRICOES':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Histórico de Restrições Médicas</h4>
              <span className="text-sm text-gray-500">
                Conforme BG PM 166/06
              </span>
            </div>

            {/* Restrição Ativa */}
            {policial.restricoes && policial.restricoes.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Restrição Ativa</span>
                </div>
                {policial.restricoes.map((rest) => (
                  <div key={rest.id}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {rest.codigos.map((code) => (
                        <span key={code} className="px-2 py-1 bg-orange-200 text-orange-800 rounded font-mono font-bold text-sm">
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-orange-700 mb-2">{rest.parecer}</p>
                    <div className="flex items-center gap-4 text-sm text-orange-600">
                      <span>Vigência: {formatDate(rest.dataInicio)} a {formatDate(rest.dataFim)}</span>
                      <span>•</span>
                      <span>{rest.documento}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Histórico */}
            {policial.historicoRestricoes && policial.historicoRestricoes.length > 0 ? (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Histórico Completo</h5>
                {policial.historicoRestricoes.map((rest) => (
                  <div key={rest.id} className={`border rounded-lg p-4 ${
                    rest.status === 'ATIVO' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        {rest.codigos.map((code) => (
                          <span key={code} className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            rest.status === 'ATIVO' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {code}
                          </span>
                        ))}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rest.status === 'ATIVO' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rest.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rest.parecer}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(rest.dataInicio)} a {formatDate(rest.dataFim)}</span>
                      <span>•</span>
                      <span>{rest.documento}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HeartPulse className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma restrição médica registrada</p>
              </div>
            )}
          </div>
        );

      case 'AFASTAMENTOS':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Histórico de Afastamentos</h4>
              <span className="text-sm text-gray-500">
                Conforme I-36-PM
              </span>
            </div>

            {/* Afastamento Ativo */}
            {policial.afastamento && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Afastamento Ativo</span>
                </div>
                <div>
                  <p className="font-medium text-red-900 mb-1">
                    {TIPOS_AFASTAMENTO.find(t => t.id === policial.afastamento?.tipoId)?.label || policial.afastamento.tipoId}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-red-600">
                    <span>Início: {formatDate(policial.afastamento.dataInicio)}</span>
                    <span>•</span>
                    <span>Término: {policial.afastamento.dataFim ? formatDate(policial.afastamento.dataFim) : 'Indeterminado'}</span>
                    <span>•</span>
                    <span>{policial.afastamento.documento}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico */}
            {policial.historicoAfastamentos && policial.historicoAfastamentos.length > 0 ? (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Histórico Completo</h5>
                {policial.historicoAfastamentos.map((afast) => (
                  <div key={afast.id} className={`border rounded-lg p-4 ${
                    afast.status === 'ATIVO' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {TIPOS_AFASTAMENTO.find(t => t.id === afast.tipoId)?.label || afast.tipoId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        afast.status === 'ATIVO' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {afast.status}
                      </span>
                    </div>
                    {afast.motivo && <p className="text-sm text-gray-600 mb-2">{afast.motivo}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(afast.dataInicio)} a {afast.dataFim ? formatDate(afast.dataFim) : 'Indeterminado'}</span>
                      <span>•</span>
                      <span>{afast.documento}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Plane className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum afastamento registrado</p>
              </div>
            )}
          </div>
        );

      case 'CURSOS':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Cursos e Capacitações</h4>
              <span className="text-sm text-gray-500">
                Total: {policial.historicoCursos?.length || 0} curso(s)
              </span>
            </div>

            {policial.historicoCursos && policial.historicoCursos.length > 0 ? (
              <div className="space-y-3">
                {policial.historicoCursos.map((curso) => (
                  <div key={curso.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{curso.nome}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        curso.situacao === 'APROVADO' ? 'bg-green-100 text-green-800' :
                        curso.situacao === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' :
                        curso.situacao === 'REPROVADO' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {curso.situacao.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-400">Instituição:</span>
                        <p className="font-medium">{curso.instituicao}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Carga Horária:</span>
                        <p className="font-medium">{curso.cargaHoraria}h</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Período:</span>
                        <p className="font-medium">{formatDate(curso.dataInicio)} a {formatDate(curso.dataFim)}</p>
                      </div>
                      {curso.documento && (
                        <div>
                          <span className="text-gray-400">Documento:</span>
                          <p className="font-medium">{curso.documento}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum curso registrado</p>
              </div>
            )}
          </div>
        );

      case 'ELOGIOS':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Elogios Recebidos</h4>
              <span className="text-sm text-gray-500">
                Total: {policial.historicoElogios?.length || 0} elogio(s)
              </span>
            </div>

            {policial.historicoElogios && policial.historicoElogios.length > 0 ? (
              <div className="space-y-3">
                {policial.historicoElogios.map((elogio) => (
                  <div key={elogio.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        elogio.tipo === 'INDIVIDUAL' ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800'
                      }`}>
                        {elogio.tipo}
                      </span>
                      <span className="text-sm text-green-700">{formatDate(elogio.data)}</span>
                    </div>
                    <p className="text-gray-900 mb-2">{elogio.motivo}</p>
                    <div className="flex items-center gap-4 text-xs text-green-600">
                      <span>Autoridade: {elogio.autoridade}</span>
                      <span>•</span>
                      <span>{elogio.documento}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum elogio registrado</p>
              </div>
            )}
          </div>
        );

      case 'PUNICOES':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Histórico Disciplinar</h4>
              <span className="text-sm text-gray-500">
                Total: {policial.historicoPunicoes?.length || 0} registro(s)
              </span>
            </div>

            {policial.historicoPunicoes && policial.historicoPunicoes.length > 0 ? (
              <div className="space-y-3">
                {policial.historicoPunicoes.map((punicao) => (
                  <div key={punicao.id} className={`border rounded-lg p-4 ${
                    punicao.cancelada ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          punicao.tipo === 'ADVERTENCIA' ? 'bg-yellow-100 text-yellow-800' :
                          punicao.tipo === 'REPREENSAO' ? 'bg-orange-100 text-orange-800' :
                          punicao.tipo === 'DETENCAO' ? 'bg-red-100 text-red-800' :
                          'bg-red-600 text-white'
                        }`}>
                          {punicao.tipo}
                        </span>
                        {punicao.cancelada && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                            CANCELADA
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{formatDate(punicao.data)}</span>
                    </div>
                    <p className="text-gray-900 mb-2">{punicao.motivo}</p>
                    {punicao.diasPunicao && (
                      <p className="text-sm text-red-700 mb-2">Dias de punição: {punicao.diasPunicao}</p>
                    )}
                    <p className="text-xs text-gray-500">{punicao.documento}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Scale className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum registro disciplinar</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">{POSTO_LABELS[policial.posto]} {policial.nomeGuerra}</h2>
                <p className="text-primary-200">{policial.nomeCompleto}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-primary-600 rounded-lg transition-colors" title="Imprimir Ficha">
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary-200">RE:</span>
              <span className="font-mono font-bold">{policial.re}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-200">OPM:</span>
              <span className="font-medium">{policial.subunidade}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-200">Função:</span>
              <span className="font-medium">{policial.funcao}</span>
            </div>
            <div className="ml-auto">
              {getStatusBadge(policial.status)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Sections */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <nav className="p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Personnel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EFETIVO' | 'CADASTRO' | 'RESTRICOES'>('EFETIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'GERAL' | 'OPM'>('GERAL');
  const [expandedOPMs, setExpandedOPMs] = useState<string[]>(['4ª Cia', '1º Pel', '2º Pel', '3º Pel']);
  const [formView, setFormView] = useState<'LIST' | 'FORM_AFASTAMENTO' | 'FORM_RESTRICAO'>('LIST');
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

  // =============================================
  // FUNÇÕES DE ORDENAÇÃO
  // =============================================

  const ordenarPorAntiguidade = (a: Policial, b: Policial): number => {
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

  // =============================================
  // DADOS FILTRADOS E ORDENADOS
  // =============================================

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
  const stats = useMemo(() => {
    return {
      total: dashboardEfetivo.data?.total || 0,
      aptos: dashboardEfetivo.data?.aptos || 0,
      restricao: dashboardEfetivo.data?.comRestricao || 0,
      afastados: dashboardEfetivo.data?.afastados || 0,
    };
  }, [dashboardEfetivo.data]);

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
            onClick={() => setSelectedPolicial(m)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Visualizar Ficha"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Editar">
            <Edit className="w-4 h-4" />
          </button>
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
            {efetivoFiltrado.map((m, index) => (
              <EfetivoRow key={m.id} m={m} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total: <span className="font-bold">{efetivoFiltrado.length}</span> policiais militares
          {debouncedSearch && ` (filtrado de ${stats.total})`}
        </p>
      </div>
    </div>
  );

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
                          <button
                            onClick={() => setSelectedPolicial(m)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Visualizar Ficha"
                          >
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
          {renderGrupo('4ª Cia', efetivoAgrupado['4ª Cia'])}
          {renderGrupo('1º Pel', efetivoAgrupado['1º Pel'])}
          {expandedOPMs.includes('1º Pel') && renderGrupo('BOp Campos do Jordão', efetivoAgrupado['BOp Campos do Jordão'], 1)}
          {renderGrupo('2º Pel', efetivoAgrupado['2º Pel'])}
          {expandedOPMs.includes('2º Pel') && renderGrupo('BOp Cruzeiro', efetivoAgrupado['BOp Cruzeiro'], 1)}
          {renderGrupo('3º Pel', efetivoAgrupado['3º Pel'])}
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Geral: <span className="font-bold">{stats.total}</span> policiais militares
          </p>
        </div>
      </div>
    );
  };

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

  const RestricoesContent = () => {
    const chartData = [
      { name: 'Aptos', value: stats.aptos, color: '#10b981' },
      { name: 'Com Restrição', value: stats.restricao, color: '#f59e0b' },
      { name: 'Afastados', value: stats.afastados, color: '#ef4444' },
    ];

    return (
      <div className="space-y-6">
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
                {efetivoFiltrado.filter(m => m.status !== StatusOperacional.APTO).map(m => (
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedPolicial(m)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver Ficha Completa"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
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
          <p className="text-sm text-gray-500 mt-1">Gestão de Efetivo da 4ª Companhia - 3º BPAmb</p>
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

          {/* Tabelas */}
          {viewMode === 'GERAL' ? <TabelaGeral /> : <TabelaAgrupada />}
        </div>
      )}

      {activeTab === 'CADASTRO' && <FormularioCadastro />}

      {activeTab === 'RESTRICOES' && <RestricoesContent />}
    </div>
  );
};
