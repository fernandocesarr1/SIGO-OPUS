/**
 * SIGO - Script de Seed do Banco de Dados
 * Popula o banco com dados iniciais para desenvolvimento/teste
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // 1. Criar Subunidades
  console.log('📍 Criando subunidades...');
  const subunidades = await Promise.all([
    prisma.subunidade.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, nome: '4ª Companhia - Sede', sigla: '4ª Cia' }
    }),
    prisma.subunidade.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, nome: 'BOp Campos do Jordão', sigla: 'BOp C.Jordão' }
    }),
    prisma.subunidade.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, nome: 'BOp Paraibuna', sigla: 'BOp Paraibuna' }
    }),
    prisma.subunidade.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, nome: 'BOp Cruzeiro', sigla: 'BOp Cruzeiro' }
    }),
  ]);
  console.log(`   ✓ ${subunidades.length} subunidades criadas\n`);

  // 2. Criar Tipos de Ocorrência
  console.log('📋 Criando tipos de ocorrência...');
  const tiposOcorrencia = await Promise.all([
    prisma.tipoOcorrencia.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, nome: 'Crime contra Fauna', descricao: 'Crimes envolvendo animais silvestres' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, nome: 'Crime contra Flora', descricao: 'Desmatamento, corte ilegal de árvores' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, nome: 'Pesca Ilegal', descricao: 'Pesca em período de defeso ou com petrechos proibidos' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, nome: 'Queimada', descricao: 'Incêndio em vegetação' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, nome: 'Poluição', descricao: 'Poluição de recursos hídricos ou solo' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, nome: 'Mineração Ilegal', descricao: 'Extração mineral sem autorização' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 7 },
      update: {},
      create: { id: 7, nome: 'Maus-tratos a Animais', descricao: 'Maus-tratos a animais domésticos ou silvestres' }
    }),
    prisma.tipoOcorrencia.upsert({
      where: { id: 8 },
      update: {},
      create: { id: 8, nome: 'Invasão de UC', descricao: 'Invasão de Unidade de Conservação' }
    }),
  ]);
  console.log(`   ✓ ${tiposOcorrencia.length} tipos de ocorrência criados\n`);

  // 3. Criar Policiais
  console.log('👮 Criando policiais...');
  const policiais = await Promise.all([
    prisma.policial.upsert({
      where: { re: '123456' },
      update: {},
      create: {
        re: '123456',
        digito: '7',
        nome: 'João da Silva Santos',
        nomeGuerra: 'SILVA',
        posto: 'CAP',
        funcao: 'Comandante de Companhia',
        subunidadeId: 1,
        email: 'silva@pm.sp.gov.br',
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '111222' },
      update: {},
      create: {
        re: '111222',
        digito: '3',
        nome: 'Marcos Oliveira Costa',
        nomeGuerra: 'OLIVEIRA',
        posto: 'TEN1',
        funcao: 'Chefe P/3',
        subunidadeId: 1,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '222333' },
      update: {},
      create: {
        re: '222333',
        digito: '4',
        nome: 'Carlos Eduardo Ferreira',
        nomeGuerra: 'FERREIRA',
        posto: 'TEN2',
        funcao: 'Chefe P/1',
        subunidadeId: 1,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '333444' },
      update: {},
      create: {
        re: '333444',
        digito: '5',
        nome: 'Roberto Santos Lima',
        nomeGuerra: 'SANTOS',
        posto: 'SGT1',
        funcao: 'Auxiliar P/1',
        subunidadeId: 1,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '444555' },
      update: {},
      create: {
        re: '444555',
        digito: '6',
        nome: 'Antonio Pereira Souza',
        nomeGuerra: 'PEREIRA',
        posto: 'SGT2',
        funcao: 'Chefe de Equipe',
        subunidadeId: 2,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '555666' },
      update: {},
      create: {
        re: '555666',
        digito: '7',
        nome: 'Lucas Almeida Rodrigues',
        nomeGuerra: 'ALMEIDA',
        posto: 'CB',
        funcao: 'Patrulheiro',
        subunidadeId: 2,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '666777' },
      update: {},
      create: {
        re: '666777',
        digito: '8',
        nome: 'Pedro Henrique Martins',
        nomeGuerra: 'MARTINS',
        posto: 'SD',
        funcao: 'Motorista',
        subunidadeId: 3,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.policial.upsert({
      where: { re: '777888' },
      update: {},
      create: {
        re: '777888',
        digito: '9',
        nome: 'Fernando Costa Ribeiro',
        nomeGuerra: 'COSTA',
        posto: 'SD',
        funcao: 'Patrulheiro',
        subunidadeId: 4,
        criadoPorUsuario: 'SEED'
      }
    }),
  ]);
  console.log(`   ✓ ${policiais.length} policiais criados\n`);

  // 4. Criar Viaturas
  console.log('🚗 Criando viaturas...');
  const viaturas = await Promise.all([
    prisma.viatura.upsert({
      where: { prefixo: 'A-03401' },
      update: {},
      create: {
        prefixo: 'A-03401',
        placa: 'DJL9090',
        modelo: 'Hilux SW4 4x4',
        marca: 'Toyota',
        ano: 2023,
        cor: 'Branca',
        kmAtual: 45000,
        kmProxRevisao: 50000,
        status: 'DISPONIVEL'
      }
    }),
    prisma.viatura.upsert({
      where: { prefixo: 'A-03402' },
      update: {},
      create: {
        prefixo: 'A-03402',
        placa: 'FGH1234',
        modelo: 'Duster',
        marca: 'Renault',
        ano: 2022,
        cor: 'Prata',
        kmAtual: 82100,
        kmProxRevisao: 90000,
        status: 'EM_USO'
      }
    }),
    prisma.viatura.upsert({
      where: { prefixo: 'A-03403' },
      update: {},
      create: {
        prefixo: 'A-03403',
        placa: 'ABC5678',
        modelo: 'Hilux CD 4x4',
        marca: 'Toyota',
        ano: 2021,
        cor: 'Branca',
        kmAtual: 120500,
        kmProxRevisao: 130000,
        status: 'MANUTENCAO'
      }
    }),
    prisma.viatura.upsert({
      where: { prefixo: 'A-03404' },
      update: {},
      create: {
        prefixo: 'A-03404',
        placa: 'XYZ9876',
        modelo: 'Trailblazer',
        marca: 'Chevrolet',
        ano: 2024,
        cor: 'Cinza',
        kmAtual: 15000,
        kmProxRevisao: 20000,
        status: 'DISPONIVEL'
      }
    }),
  ]);
  console.log(`   ✓ ${viaturas.length} viaturas criadas\n`);

  // 5. Criar Materiais
  console.log('📦 Criando materiais...');
  const materiais = await Promise.all([
    prisma.material.upsert({
      where: { codigo: 'ARM-001' },
      update: {},
      create: {
        codigo: 'ARM-001',
        nome: 'Pistola Taurus PT 100',
        categoria: 'Armamento',
        unidade: 'UN',
        quantidadeAtual: 15,
        quantidadeMinima: 10,
        localizacao: 'Reserva de Armas'
      }
    }),
    prisma.material.upsert({
      where: { codigo: 'MUN-001' },
      update: {},
      create: {
        codigo: 'MUN-001',
        nome: 'Munição .40 S&W',
        categoria: 'Munição',
        unidade: 'CX',
        quantidadeAtual: 50,
        quantidadeMinima: 30,
        localizacao: 'Paiol'
      }
    }),
    prisma.material.upsert({
      where: { codigo: 'EQP-001' },
      update: {},
      create: {
        codigo: 'EQP-001',
        nome: 'Colete Balístico Nível IIIA',
        categoria: 'Equipamento',
        unidade: 'UN',
        quantidadeAtual: 20,
        quantidadeMinima: 15,
        localizacao: 'Almoxarifado'
      }
    }),
    prisma.material.upsert({
      where: { codigo: 'COM-001' },
      update: {},
      create: {
        codigo: 'COM-001',
        nome: 'Rádio HT Motorola',
        categoria: 'Comunicação',
        unidade: 'UN',
        quantidadeAtual: 12,
        quantidadeMinima: 8,
        localizacao: 'Sala de Comunicações'
      }
    }),
  ]);
  console.log(`   ✓ ${materiais.length} materiais criados\n`);

  // 6. Criar Afastamentos de exemplo
  console.log('📅 Criando afastamentos de exemplo...');
  const hoje = new Date();
  const afastamentos = await Promise.all([
    prisma.afastamento.create({
      data: {
        policialId: policiais[3].id, // SANTOS
        tipo: 'FERIAS',
        dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
        dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
        documento: 'Bol Int 012/26',
        contaEfetivoExercicio: true,
        criadoPorUsuario: 'SEED'
      }
    }),
  ]);
  console.log(`   ✓ ${afastamentos.length} afastamentos criados\n`);

  // 7. Criar Restrições de exemplo
  console.log('⚠️ Criando restrições de exemplo...');
  const restricoes = await Promise.all([
    prisma.restricao.create({
      data: {
        policialId: policiais[5].id, // ALMEIDA
        codigos: ['EF', 'LP'],
        dataInicio: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 10),
        dataFim: new Date(hoje.getFullYear(), hoje.getMonth() + 2, 10),
        documento: 'Ata JS 055/26',
        temCodigoCritico: false,
        criadoPorUsuario: 'SEED'
      }
    }),
  ]);
  console.log(`   ✓ ${restricoes.length} restrições criadas\n`);

  // 8. Criar Ocorrências de exemplo
  console.log('📝 Criando ocorrências de exemplo...');
  const ocorrencias = await Promise.all([
    prisma.ocorrencia.create({
      data: {
        numero: 'BOP-2026-0001',
        tipoId: 1, // Crime contra Fauna
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 5),
        local: 'Parque Estadual de Campos do Jordão',
        municipio: 'Campos do Jordão',
        descricao: 'Apreensão de pássaros silvestres em cativeiro irregular',
        status: 'CONCLUIDA',
        policialResponsavelId: policiais[4].id,
        viaturaId: viaturas[0].id,
        autoInfracao: 'AI-2026-0012',
        areaPatrulhadaKm: 45,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.ocorrencia.create({
      data: {
        numero: 'BOP-2026-0002',
        tipoId: 2, // Crime contra Flora
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3),
        local: 'Serra da Mantiqueira',
        municipio: 'Cruzeiro',
        descricao: 'Desmatamento em área de preservação permanente',
        status: 'EM_ANDAMENTO',
        policialResponsavelId: policiais[6].id,
        viaturaId: viaturas[1].id,
        areaPatrulhadaKm: 120,
        criadoPorUsuario: 'SEED'
      }
    }),
    prisma.ocorrencia.create({
      data: {
        numero: 'BOP-2026-0003',
        tipoId: 3, // Pesca Ilegal
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1),
        local: 'Represa do Jaguari',
        municipio: 'Paraibuna',
        descricao: 'Pesca com rede durante período de defeso',
        status: 'REGISTRADA',
        policialResponsavelId: policiais[7].id,
        areaPatrulhadaKm: 30,
        criadoPorUsuario: 'SEED'
      }
    }),
  ]);
  console.log(`   ✓ ${ocorrencias.length} ocorrências criadas\n`);

  // 9. Criar Operação de exemplo
  console.log('🎯 Criando operações de exemplo...');
  const operacoes = await Promise.all([
    prisma.operacao.create({
      data: {
        nome: 'Operação Corta-Fogo',
        descricao: 'Operação de prevenção e combate a queimadas durante período de estiagem',
        dataInicio: new Date(hoje.getFullYear(), 6, 1), // Julho
        dataFim: new Date(hoje.getFullYear(), 9, 31), // Outubro
        localidade: 'Vale do Paraíba',
        objetivo: 'Reduzir focos de incêndio em 30% comparado ao ano anterior',
        efetivoPrevisto: 25,
        efetivoReal: 22,
        viaturasUtilizadas: 4,
        ativa: true,
        criadoPorUsuario: 'SEED'
      }
    }),
  ]);
  console.log(`   ✓ ${operacoes.length} operações criadas\n`);

  console.log('✅ Seed concluído com sucesso!\n');
  console.log('Resumo:');
  console.log(`   • ${subunidades.length} subunidades`);
  console.log(`   • ${tiposOcorrencia.length} tipos de ocorrência`);
  console.log(`   • ${policiais.length} policiais`);
  console.log(`   • ${viaturas.length} viaturas`);
  console.log(`   • ${materiais.length} materiais`);
  console.log(`   • ${afastamentos.length} afastamentos`);
  console.log(`   • ${restricoes.length} restrições`);
  console.log(`   • ${ocorrencias.length} ocorrências`);
  console.log(`   • ${operacoes.length} operações`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
