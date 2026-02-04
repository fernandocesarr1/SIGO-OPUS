import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Truck
} from 'lucide-react';
import { 
  Militar, 
  StatusOperacional, 
  IndicadorOperacional, 
  OcorrenciaRecent, 
  Viatura,
  RestricaoDefinition,
  TipoAfastamentoDefinition
} from './types';

export const CODIGOS_RESTRICAO: Record<string, RestricaoDefinition> = {
  AU: { codigo: 'AU', descricao: 'Audição seja primordial', detalhe: 'Atividades administrativas' },
  BS: { codigo: 'BS', descricao: 'Busca e salvamento', detalhe: 'Operacional na Unidade ou apoio' },
  CB: { codigo: 'CB', descricao: 'Corte de barba', detalhe: 'Uniforme B-5.1' },
  CC: { codigo: 'CC', descricao: 'Corte de cabelo', detalhe: 'Uniforme B-5.1, gel/rede' },
  CI: { codigo: 'CI', descricao: 'Correr para incêndio', detalhe: 'Apoio/Admin' },
  DG: { codigo: 'DG', descricao: 'Datilografia e Digitação', detalhe: 'Policiamento ostensivo' },
  DV: { codigo: 'DV', descricao: 'Dirigir veículo', detalhe: 'Não pode ser motorista', critico: true },
  EF: { codigo: 'EF', descricao: 'Educação Física', detalhe: 'Plano compatível' },
  EM: { codigo: 'EM', descricao: 'Escrever a mão', detalhe: 'Policiamento ostensivo' },
  EP: { codigo: 'EP', descricao: 'Equilíbrio seja primordial', detalhe: 'Atividades administrativas' },
  ES: { codigo: 'ES', descricao: 'Exposição ao sol', detalhe: 'Atividades administrativas' },
  FO: { codigo: 'FO', descricao: 'Formatura', detalhe: 'Apoio/Admin' },
  IS: { codigo: 'IS', descricao: 'Tocar instrumento de sopro', detalhe: 'Apoio/Admin' },
  LP: { codigo: 'LP', descricao: 'Longa permanência em pé', detalhe: 'Apoio/Admin' },
  LR: { codigo: 'LR', descricao: 'Locais ruidosos', detalhe: 'Atividades administrativas' },
  LS: { codigo: 'LS', descricao: 'Longa permanência sentado', detalhe: 'Policiamento ostensivo' },
  MA: { codigo: 'MA', descricao: 'Manuseio com animais', detalhe: 'Apoio/Admin' },
  MC: { codigo: 'MC', descricao: 'Montar a cavalo', detalhe: 'Apoio/Admin' },
  MG: { codigo: 'MG', descricao: 'Mergulho', detalhe: 'Apoio/Admin' },
  MP: { codigo: 'MP', descricao: 'Manipulação de pó', detalhe: 'Policiamento ostensivo' },
  OU: { codigo: 'OU', descricao: 'Ordem unida', detalhe: 'Apoio/Admin' },
  PO: { codigo: 'PO', descricao: 'Policiamento', detalhe: 'Guarda/Admin/Apoio', critico: true },
  PQ: { codigo: 'PQ', descricao: 'Serviços com produtos químicos', detalhe: 'Apoio/Admin' },
  PT: { codigo: 'PT', descricao: 'Prática de tiro', detalhe: 'Atividades administrativas' },
  SA: { codigo: 'SA', descricao: 'Serviços aquáticos', detalhe: 'Apoio/Admin' },
  SB: { codigo: 'SB', descricao: 'Serviços burocráticos', detalhe: 'Policiamento ostensivo' },
  SE: { codigo: 'SE', descricao: 'Serviços externos', detalhe: 'IMPLICA EM UU - BG PM 232/08', critico: true },
  SF: { codigo: 'SF', descricao: 'Subir e descer frequente', detalhe: 'Apoio/Admin' },
  SG: { codigo: 'SG', descricao: 'Serviço de guarda', detalhe: 'Preferencialmente PO' },
  SH: { codigo: 'SH', descricao: 'Serviços em altura', detalhe: 'Operacional limitado' },
  SI: { codigo: 'SI', descricao: 'Serviços internos', detalhe: 'Policiamento ostensivo' },
  SM: { codigo: 'SM', descricao: 'Serviços manuais', detalhe: 'Operacional limitado' },
  SN: { codigo: 'SN', descricao: 'Serviços noturnos', detalhe: 'Diurno apenas' },
  SP: { codigo: 'SP', descricao: 'Serviços pesados', detalhe: 'Operacional limitado' },
  ST: { codigo: 'ST', descricao: 'Serviços de telefonia', detalhe: 'Policiamento ostensivo' },
  UA: { codigo: 'UA', descricao: 'Uso de arma', detalhe: 'ADMINISTRATIVO APENAS', critico: true },
  UB: { codigo: 'UB', descricao: 'Uso de botas', detalhe: 'Sandália/Tênis' },
  UC: { codigo: 'UC', descricao: 'Uso de calçado esportivo', detalhe: 'Sandália' },
  US: { codigo: 'US', descricao: 'Uso de sapatos', detalhe: 'Sandália' },
  UU: { codigo: 'UU', descricao: 'Uso de uniformes', detalhe: 'Usa B-5.1 ou Civil' },
  VP: { codigo: 'VP', descricao: 'Visão seja primordial', detalhe: 'Atividades administrativas' },
};

export const TIPOS_AFASTAMENTO: TipoAfastamentoDefinition[] = [
  { id: 'FERIAS', label: 'Férias', contaEfetivoExercicio: true, inciso: 'I' },
  { id: 'LICENCA_PREMIO', label: 'Licença-Prêmio', contaEfetivoExercicio: true, inciso: 'II' },
  { id: 'LICENCA_SAUDE_FAMILIA', label: 'Lic. Saúde Família', contaEfetivoExercicio: true, inciso: 'III' },
  { id: 'LTS', label: 'Lic. Tratamento Saúde (LTS)', contaEfetivoExercicio: true, inciso: 'IV' },
  { id: 'CONVALESCENCA', label: 'Convalescença', contaEfetivoExercicio: true, inciso: 'IV' },
  { id: 'LICENCA_GESTANTE', label: 'Licença-Gestante', contaEfetivoExercicio: true, inciso: 'V' },
  { id: 'LICENCA_PATERNIDADE', label: 'Licença-Paternidade', contaEfetivoExercicio: true, inciso: 'VI' },
  { id: 'LICENCA_ADOCAO', label: 'Licença por Adoção', contaEfetivoExercicio: true, inciso: 'VII' },
  { id: 'LICENCA_CASAMENTO', label: 'Núpcias (Gala)', contaEfetivoExercicio: true, inciso: 'VIII' },
  { id: 'LICENCA_NOJO', label: 'Luto (Nojo)', contaEfetivoExercicio: true, inciso: 'IX' },
  { id: 'LTS_COMPULSORIA', label: 'Licença Compulsória', contaEfetivoExercicio: true, inciso: 'X' },
  { id: 'MISSAO_ESTUDOS', label: 'Missão/Estudos', contaEfetivoExercicio: true, inciso: 'XI' },
  { id: 'TREINAMENTO_CURSO', label: 'Treinamento/Curso', contaEfetivoExercicio: true, inciso: 'XII' },
  { id: 'TRANSITO_MUDANCA', label: 'Trânsito/Mudança', contaEfetivoExercicio: true, inciso: 'XIII' },
  { id: 'JURI', label: 'Júri', contaEfetivoExercicio: true, inciso: 'XIV' },
  { id: 'DOACAO_SANGUE', label: 'Doação de Sangue', contaEfetivoExercicio: true, inciso: 'XV' },
  { id: 'LIC_TRATAR_INT_PARTICULAR', label: 'Lic. Interesse Particular', contaEfetivoExercicio: false, inciso: 'XVI' },
  { id: 'LIC_ACOMP_CONJUGE', label: 'Lic. Acomp. Cônjuge', contaEfetivoExercicio: false, inciso: 'XVII' },
  { id: 'LIC_EXERC_ATIV_PRIVADA', label: 'Lic. Atividade Privada', contaEfetivoExercicio: false, inciso: 'XVIII' },
  { id: 'PRISAO', label: 'Prisão', contaEfetivoExercicio: false, inciso: '-' },
  { id: 'AGREGACAO', label: 'Agregação', contaEfetivoExercicio: false, inciso: '-' },
  { id: 'OUTROS', label: 'Outros Afastamentos', contaEfetivoExercicio: true, inciso: '-' },
];

export const mockMilitares: Militar[] = [
  { 
    id: 1, 
    re: "123.456-7", 
    posto: 'CAP', 
    nomeGuerra: "SILVA", 
    nomeCompleto: "João da Silva", 
    funcao: "Comandante Cia", 
    status: StatusOperacional.APTO,
    pelotao: "Estado Maior",
    subunidade: "4ª Cia"
  },
  { 
    id: 2, 
    re: "111.222-3", 
    posto: '1TEN', 
    nomeGuerra: "OLIVEIRA", 
    nomeCompleto: "Marcos Oliveira", 
    funcao: "Chefe P/3", 
    status: StatusOperacional.APTO,
    pelotao: "P/3",
    subunidade: "4ª Cia"
  },
  { 
    id: 3, 
    re: "333.444-5", 
    posto: '1SGT', 
    nomeGuerra: "SANTOS", 
    nomeCompleto: "Roberto Santos", 
    funcao: "Auxiliar P/1", 
    status: StatusOperacional.AFASTADO,
    pelotao: "P/1",
    subunidade: "4ª Cia",
    afastamento: {
      id: 101,
      tipoId: 'FERIAS',
      dataInicio: '2026-02-01',
      dataFim: '2026-03-02',
      documento: 'Bol Int 012/26'
    }
  },
  { 
    id: 4, 
    re: "555.666-7", 
    posto: 'CB', 
    nomeGuerra: "PEREIRA", 
    nomeCompleto: "Lucas Pereira", 
    funcao: "Patrulheiro", 
    status: StatusOperacional.APTO_COM_RESTRICAO,
    pelotao: "1º Pel",
    subunidade: "BOp C. Jordão",
    restricoes: [
      {
        id: 201,
        codigos: ['EF', 'LP'],
        parecer: 'APTO_RESTRICAO',
        dataInicio: '2026-01-10',
        dataFim: '2026-04-10',
        documento: 'Ata JS 55/26'
      }
    ]
  },
];

export const mockIndicadores: IndicadorOperacional[] = [
  { name: 'Jan', bos: 40, autos: 24, atendimentos: 65 },
  { name: 'Fev', bos: 30, autos: 18, atendimentos: 55 },
  { name: 'Mar', bos: 20, autos: 35, atendimentos: 80 },
  { name: 'Abr', bos: 27, autos: 28, atendimentos: 70 },
  { name: 'Mai', bos: 50, autos: 40, atendimentos: 90 },
  { name: 'Jun', bos: 23, autos: 20, atendimentos: 60 },
];

export const mockOcorrencias: OcorrenciaRecent[] = [
  { id: "BOP-20240115", tipo: "Crime contra Fauna", local: "Campos do Jordão", data: "15/01/2026", status: "Em Andamento" },
  { id: "BOP-20240114", tipo: "Desmatamento", local: "Cruzeiro", data: "14/01/2026", status: "Concluída" },
  { id: "BOP-20240114", tipo: "Pesca Ilegal", local: "Paraibuna", data: "14/01/2026", status: "Registrada" },
  { id: "BOP-20240112", tipo: "Queimada", local: "Taubaté", data: "12/01/2026", status: "Concluída" },
];

export const mockViaturas: Viatura[] = [
  { id: 1, prefixo: "A-03401", modelo: "Hilux 4x4", placa: "DJL-9090", status: "Disponível", km: 45000 },
  { id: 2, prefixo: "A-03402", modelo: "Duster", placa: "FGH-1234", status: "Em Uso", km: 82100 },
  { id: 3, prefixo: "A-03403", modelo: "Hilux 4x4", placa: "ABC-5678", status: "Manutenção", km: 120500 },
  { id: 4, prefixo: "A-03404", modelo: "Trailblazer", placa: "XYZ-9876", status: "Disponível", km: 15000 },
];

export const dashboardStats = [
  { title: "Efetivo Ativo", value: 142, change: "+2 este mês", trend: "up" as const, icon: Users, color: "bg-p1" },
  { title: "Ocorrências (Mês)", value: 47, change: "+12% vs mês ant.", trend: "up" as const, icon: FileText, color: "bg-p3" },
  { title: "Viaturas Disp.", value: "9/12", change: "2 em manutenção", trend: "down" as const, icon: Truck, color: "bg-p4" },
  { title: "Alertas", value: 3, change: "Ação requerida", trend: "neutral" as const, icon: AlertTriangle, color: "bg-red-500" },
];