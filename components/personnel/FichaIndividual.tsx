/**
 * SIGO - Componente Ficha Individual do Policial
 * Modal com dados completos e históricos do PM
 */

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  FileText,
  TrendingUp,
  Medal,
  MapPin,
  Phone,
  Mail,
  Award,
  ArrowUpRight,
  GraduationCap,
  HeartPulse,
  Plane,
  Scale,
  Shield,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { POSTO_LABELS, StatusOperacional } from '../../types';
import { TIPOS_AFASTAMENTO } from '../../data';
import type { Policial } from '../../types/personnel';

interface FichaIndividualProps {
  policial: Policial;
  onClose: () => void;
}

export const FichaIndividual: React.FC<FichaIndividualProps> = ({ policial, onClose }) => {
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
                  {policial.historicoPromocoes.map((promo) => (
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

export default FichaIndividual;
