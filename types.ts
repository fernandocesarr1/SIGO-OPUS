import { LucideIcon } from 'lucide-react';

export type PostoGraduacao = 'CAP' | '1TEN' | '2TEN' | 'SUBTEN' | '1SGT' | '2SGT' | '3SGT' | 'CB' | 'SD';

export const POSTO_LABELS: Record<PostoGraduacao, string> = {
  CAP: 'Cap PM',
  '1TEN': '1º Ten PM',
  '2TEN': '2º Ten PM',
  SUBTEN: 'Subten PM',
  '1SGT': '1º Sgt PM',
  '2SGT': '2º Sgt PM',
  '3SGT': '3º Sgt PM',
  CB: 'Cb PM',
  SD: 'Sd PM',
};

export enum StatusOperacional {
  APTO = 'APTO',
  APTO_COM_RESTRICAO = 'APTO_COM_RESTRICAO',
  AFASTADO = 'AFASTADO',
}

export interface RestricaoDefinition {
  codigo: string;
  descricao: string;
  detalhe: string;
  critico?: boolean;
}

export interface TipoAfastamentoDefinition {
  id: string;
  label: string;
  contaEfetivoExercicio: boolean;
  inciso: string;
}

export interface RestricaoAtiva {
  id: number;
  codigos: string[];
  parecer: string;
  dataInicio: string;
  dataFim: string;
  documento: string;
}

export interface AfastamentoAtivo {
  id: number;
  tipoId: string;
  dataInicio: string;
  dataFim: string | null;
  documento: string;
}

export interface Militar {
  id: number;
  re: string;
  posto: PostoGraduacao;
  nomeGuerra: string;
  nomeCompleto: string;
  funcao: string;
  pelotao: string;
  subunidade: string;
  status: StatusOperacional;
  restricoes?: RestricaoAtiva[];
  afastamento?: AfastamentoAtivo;
}

export interface StatMetric {
  title: string;
  value: string | number;
  change?: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
}

export interface IndicadorOperacional {
  name: string;
  bos: number;
  autos: number;
  atendimentos: number;
}

export interface OcorrenciaRecent {
  id: string;
  tipo: string;
  local: string;
  data: string;
  status: 'Registrada' | 'Em Andamento' | 'Concluída';
}

export interface Viatura {
  id: number;
  prefixo: string;
  modelo: string;
  placa: string;
  status: 'Disponível' | 'Manutenção' | 'Baixada' | 'Em Uso';
  km: number;
}