/**
 * SIGO - Tipos para o módulo de Pessoal (P/1)
 * Tipos compartilhados entre componentes de Personnel
 */

import { PostoGraduacao, StatusOperacional } from '../types';

// Histórico de restrições médicas
export interface RestricaoHistorico {
  id: number;
  codigos: string[];
  parecer: string;
  dataInicio: string;
  dataFim: string;
  documento: string;
  status: 'ATIVO' | 'ENCERRADO';
}

// Histórico de afastamentos
export interface AfastamentoHistorico {
  id: number;
  tipoId: string;
  dataInicio: string;
  dataFim: string | null;
  documento: string;
  motivo?: string;
  status: 'ATIVO' | 'ENCERRADO';
}

// Histórico de promoções
export interface PromocaoHistorico {
  id: number;
  postoAnterior: PostoGraduacao;
  postoNovo: PostoGraduacao;
  data: string;
  documento: string;
  tipo: 'ANTIGUIDADE' | 'MERECIMENTO' | 'BRAVURA' | 'POST_MORTEM';
}

// Histórico de movimentações
export interface MovimentacaoHistorico {
  id: number;
  opmOrigem: string;
  opmDestino: string;
  data: string;
  documento: string;
  tipo: 'TRANSFERENCIA' | 'CLASSIFICACAO' | 'RECLASSIFICACAO' | 'ADIDAMENTO';
}

// Histórico de elogios
export interface ElogioHistorico {
  id: number;
  tipo: 'INDIVIDUAL' | 'COLETIVO';
  motivo: string;
  data: string;
  documento: string;
  autoridade: string;
}

// Histórico de punições
export interface PunicaoHistorico {
  id: number;
  tipo: 'ADVERTENCIA' | 'REPREENSAO' | 'DETENCAO' | 'PRISAO';
  motivo: string;
  data: string;
  documento: string;
  diasPunicao?: number;
  cancelada?: boolean;
}

// Histórico de cursos
export interface CursoHistorico {
  id: number;
  nome: string;
  instituicao: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  situacao: 'APROVADO' | 'REPROVADO' | 'EM_ANDAMENTO' | 'DESISTENTE';
  documento?: string;
}

// Interface completa do Policial para ficha individual
export interface Policial {
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

// Ordenação por posto/graduação (hierarquia)
export const ORDEM_POSTO: Record<PostoGraduacao, number> = {
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

// Estrutura organizacional da OPM
export const OPM_ESTRUTURA = {
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

// Props do formulário de cadastro
export interface FormularioCadastroData {
  re: string;
  nome: string;
  nomeGuerra: string;
  posto: string;
  opm: string;
  funcao: string;
  dataPromocao: string;
  dataIngresso: string;
  email: string;
  telefone: string;
}

// Estatísticas do efetivo
export interface EfetivoStats {
  total: number;
  aptos: number;
  restricao: number;
  afastados: number;
  ultimaAtualizacao: string | null;
}

// Função de ordenação por antiguidade
export function ordenarPorAntiguidade(a: Policial, b: Policial): number {
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
}
