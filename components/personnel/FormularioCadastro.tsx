/**
 * SIGO - Componente de Formulário de Cadastro de Policial
 * Permite cadastrar novos policiais no sistema
 */

import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';
import type { FormularioCadastroData } from '../../types/personnel';

interface FormularioCadastroProps {
  onSubmit?: (data: FormularioCadastroData) => void;
  loading?: boolean;
}

export const FormularioCadastro: React.FC<FormularioCadastroProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormularioCadastroData>({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleClear = () => {
    setFormData({
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
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <UserPlus className="w-6 h-6 text-primary-600 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Policial</h2>
          <p className="text-sm text-gray-500">Preencha os dados para incluir um novo PM no efetivo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RE (Registro Estatístico) *</label>
            <input
              type="text"
              placeholder="Ex: 123.456-7"
              value={formData.re}
              onChange={(e) => setFormData({...formData, re: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posto/Graduação *</label>
            <select
              value={formData.posto}
              onChange={(e) => setFormData({...formData, posto: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
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
              required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OPM (Unidade) *</label>
            <select
              value={formData.opm}
              onChange={(e) => setFormData({...formData, opm: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
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
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Policial'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioCadastro;
