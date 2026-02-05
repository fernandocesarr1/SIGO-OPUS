/**
 * SIGO - Script de Seed do Banco de Dados
 * Efetivo Real da 4ª Companhia do 3º BPM Amb
 *
 * ÚLTIMA ATUALIZAÇÃO DA RELAÇÃO: 02 de janeiro de 2025
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data da última atualização do efetivo
const DATA_ULTIMA_ATUALIZACAO = '2025-01-02';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');
  console.log(`📅 Relação atualizada em: ${DATA_ULTIMA_ATUALIZACAO}\n`);

  // 1. Criar Subunidades
  console.log('📍 Criando subunidades...');
  const subunidades = await Promise.all([
    prisma.subunidade.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, nome: 'Seção de Comando', sigla: '4ª Cia - Cmd' }
    }),
    prisma.subunidade.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, nome: '1º Pelotão PAMB - Taubaté', sigla: '1º Pel' }
    }),
    prisma.subunidade.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, nome: 'BOp Campos do Jordão', sigla: 'BOp C.Jordão' }
    }),
    prisma.subunidade.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, nome: '2º Pelotão PAMB - Guaratinguetá', sigla: '2º Pel' }
    }),
    prisma.subunidade.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, nome: 'BOp Cruzeiro', sigla: 'BOp Cruzeiro' }
    }),
    prisma.subunidade.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, nome: 'GP TÁT AMB', sigla: 'GP TÁT' }
    }),
    prisma.subunidade.upsert({
      where: { id: 7 },
      update: {},
      create: { id: 7, nome: '3º Pelotão PAMB - São José dos Campos', sigla: '3º Pel' }
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

  // 3. Criar Policiais - EFETIVO REAL DA 4ª CIA
  console.log('👮 Criando policiais do efetivo real...');

  // =============================================
  // SEÇÃO DE COMANDO (subunidadeId: 1)
  // =============================================
  const secaoComando = [
    { re: '121924', digito: '3', nome: 'FERNANDO CESAR DE CARVALHO', nomeGuerra: 'FERNANDO CESAR', posto: 'CAP', funcao: 'Comandante' },
    { re: '115428', digito: '1', nome: 'JORGE MARCELO FREITAS RIBEIRO', nomeGuerra: 'JORGE MARCELO', posto: 'SUBTEN', funcao: 'Subcomandante' },
    { re: '152616', digito: '2', nome: 'VINÍCIUS AMORIM BARRETO', nomeGuerra: 'VINÍCIUS AMORIM', posto: 'SGT2', funcao: 'Auxiliar Administrativo' },
    { re: '115498', digito: '2', nome: 'ROBINSON ALESSANDRO DE ALMEIDA', nomeGuerra: 'ROBINSON', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '122960', digito: '5', nome: 'RUY CARVALHO JÚNIOR', nomeGuerra: 'RUY CARVALHO', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '961722', digito: '1', nome: 'ELIZENDA PEREIRA ANDRADE BARRA DIAS', nomeGuerra: 'ELIZENDA', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '101045', digito: '0', nome: 'CHRISTIANO BRUGNEROTTI GONÇALVES', nomeGuerra: 'CHRISTIANO', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '101589', digito: '3', nome: 'SAMUEL RIBEIRO DA SILVA', nomeGuerra: 'SAMUEL RIBEIRO', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '143432', digito: '2', nome: 'ANDRÉ LUIZ VELLOSO DE FREITAS', nomeGuerra: 'ANDRÉ VELLOSO', posto: 'CB', funcao: 'Auxiliar Administrativo' },
    { re: '149136', digito: '9', nome: 'MATEUS MOREIRA BARBOSA', nomeGuerra: 'MATEUS MOREIRA', posto: 'SD', funcao: 'Auxiliar Administrativo' },
    { re: '157266', digito: 'A', nome: 'CARLOS DRUMOND DA COSTA NETO', nomeGuerra: 'DRUMOND', posto: 'SD', funcao: 'Auxiliar Administrativo' },
  ];

  // =============================================
  // 1º PELOTÃO PAMB - TAUBATÉ (subunidadeId: 2)
  // =============================================
  const pelotao1Sede = [
    { re: '180316', digito: '6', nome: 'EMMANUELLE TAFNES NEVES', nomeGuerra: 'EMMANUELLE', posto: 'TEN1', funcao: 'Comandante de Pelotão' },
    { re: '941792', digito: '3', nome: 'MARCO ANTONIO DE OLIVEIRA', nomeGuerra: 'MARCO ANTONIO', posto: 'SGT1', funcao: 'Adjunto' },
    { re: '953100', digito: '9', nome: 'SIDNEY MARCIO DE FARIA', nomeGuerra: 'SIDNEY', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101517', digito: '6', nome: 'LUIS FERNANDO VIEIRA', nomeGuerra: 'LUIS FERNANDO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '109512', digito: '9', nome: 'SANDRO MARCELO ALMEIDA DA SILVA', nomeGuerra: 'SANDRO MARCELO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101671', digito: '7', nome: 'RENATO MALAVAZI', nomeGuerra: 'MALAVAZI', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '112909', digito: 'A', nome: 'RUBENS SARTORI CASTILHO CABRAL', nomeGuerra: 'RUBENS SARTORI', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '125098', digito: '1', nome: 'ENOCK RODRIGUES PINTO', nomeGuerra: 'ENOCK', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '149624', digito: '7', nome: 'GERBES RODRIGUES RIBEIRO', nomeGuerra: 'GERBES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '161239', digito: '5', nome: 'DANIEL BATISTA DIOGO DOS SANTOS', nomeGuerra: 'DANIEL BATISTA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '151393', digito: '1', nome: 'BIANCA APARECIDA MOREIRA', nomeGuerra: 'BIANCA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '156921', digito: '0', nome: 'LEANDRO DE MORAES', nomeGuerra: 'LEANDRO MORAES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '153585', digito: '4', nome: 'LUCIANO DE MORAIS LEAL', nomeGuerra: 'LUCIANO LEAL', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '133770', digito: '0', nome: 'FELIX GUSMÃO DAS CHAGAS', nomeGuerra: 'FELIX GUSMÃO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '139529', digito: '7', nome: 'WILLIANS DA SILVA AMARAL', nomeGuerra: 'WILLIANS', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '148751', digito: '5', nome: 'THAÍS MARA DE BARROS MONTEIRO', nomeGuerra: 'THAÍS MARA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '151220', digito: '0', nome: 'ARICLENES FELIPE CARVALHO DA SILVA', nomeGuerra: 'ARICLENES', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '156909', digito: 'A', nome: 'FELIPE AUGUSTO DE CARVALHO', nomeGuerra: 'FELIPE AUGUSTO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '157008', digito: 'A', nome: 'THIAGO DE OLIVEIRA NÚBILE', nomeGuerra: 'THIAGO NÚBILE', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '157027', digito: '7', nome: 'RENAN RAYMUNDO DA SILVA', nomeGuerra: 'RENAN RAYMUNDO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '157242', digito: '3', nome: 'LUCAS DE SOUZA SAMPAIO ANTUNES', nomeGuerra: 'LUCAS SAMPAIO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '170657', digito: '8', nome: 'PAULO SÉRGIO ANDRADE TEIXEIRA JÚNIOR', nomeGuerra: 'PAULO SÉRGIO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '194343', digito: '0', nome: 'NÁDIA SANTOS SILVA', nomeGuerra: 'NÁDIA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '195000', digito: '2', nome: 'TATIANE REIS ARAÚJO PEREIRA', nomeGuerra: 'TATIANE', posto: 'SD', funcao: 'Patrulheiro' },
  ];

  // =============================================
  // BOp CAMPOS DO JORDÃO (subunidadeId: 3)
  // =============================================
  const bopCamposJordao = [
    { re: '953064', digito: '9', nome: 'ELIAS HENRIQUE SACHETTI', nomeGuerra: 'SACHETTI', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101562', digito: '1', nome: 'VALMIR DE JESUS', nomeGuerra: 'VALMIR', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '122909', digito: '5', nome: 'EVERTON MOREIRA DE SOUZA', nomeGuerra: 'EVERTON MOREIRA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '128963', digito: '2', nome: 'EMIL DOMIT MARÇOLA', nomeGuerra: 'EMIL DOMIT', posto: 'CB', funcao: 'Patrulheiro' },
  ];

  // =============================================
  // 2º PELOTÃO PAMB - GUARATINGUETÁ (subunidadeId: 4)
  // =============================================
  const pelotao2Sede = [
    { re: '135001', digito: '3', nome: 'FABIO XAVIER BARBOSA', nomeGuerra: 'FABIO XAVIER', posto: 'TEN1', funcao: 'Comandante de Pelotão' },
    { re: '961714', digito: 'A', nome: 'RAQUEL DAS GRAÇAS BENEDICTO DE OLIVEIRA', nomeGuerra: 'RAQUEL', posto: 'SGT1', funcao: 'Adjunto' },
    { re: '961676', digito: '4', nome: 'KELI CRISTINA MONTEIRO DA SILVA', nomeGuerra: 'KELI CRISTINA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101510', digito: '9', nome: 'JOSÉ BITTENCOURT ÁVILA JUNIOR', nomeGuerra: 'BITTENCOURT', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '118333', digito: '8', nome: 'TIAGO DA SILVA FREITAS', nomeGuerra: 'TIAGO FREITAS', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '115427', digito: '3', nome: 'CARLOS AUGUSTO DA SILVA JÚNIOR', nomeGuerra: 'CARLOS AUGUSTO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '112994', digito: '5', nome: 'MATEUS EDUARDO MORAES', nomeGuerra: 'MATEUS EDUARDO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '113193', digito: '1', nome: 'CHRISTIAN GONÇALVES DIAS DA SILVA', nomeGuerra: 'CHRISTIAN', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '115339', digito: 'A', nome: 'RAFAEL DE OLIVEIRA PRADO', nomeGuerra: 'RAFAEL PRADO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '129582', digito: '9', nome: 'BRUNO HENRIQUE ALVARENGA SOUSA', nomeGuerra: 'BRUNO ALVARENGA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '130757', digito: '6', nome: 'MARCO ANTONIO DE OLIVEIRA', nomeGuerra: 'MARCO OLIVEIRA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '135499', digito: '0', nome: 'TIAGO DOS SANTOS CHAVES', nomeGuerra: 'TIAGO CHAVES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '137504', digito: 'A', nome: 'ARTHUR CARVALHO ROCHA', nomeGuerra: 'ARTHUR ROCHA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '132479', digito: '9', nome: 'WELLINGTON CÉSAR DA SILVA MORAIS', nomeGuerra: 'WELLINGTON', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '138092', digito: '3', nome: 'FABIO HENRIQUE OLIVEIRA', nomeGuerra: 'FABIO HENRIQUE', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '170099', digito: '5', nome: 'TAMIRES FERNANDA PETRONILHO SANTANA', nomeGuerra: 'TAMIRES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '147002', digito: '7', nome: 'ANDRÉ LUIS PINTO CAROLLO', nomeGuerra: 'ANDRÉ CAROLLO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '161698', digito: '6', nome: 'ALINE APARECIDA SANTOS SOUZA OLIVEIRA', nomeGuerra: 'ALINE SOUZA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '171105', digito: '9', nome: 'CAMILA GABRIELA VIEIRA MONTEIRO', nomeGuerra: 'CAMILA VIEIRA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '193664', digito: '6', nome: 'GABRIEL JOSUÉ SANTOS DE JESUS', nomeGuerra: 'GABRIEL JOSUÉ', posto: 'SD', funcao: 'Patrulheiro' },
  ];

  // =============================================
  // BOp CRUZEIRO (subunidadeId: 5)
  // =============================================
  const bopCruzeiro = [
    { re: '106580', digito: '7', nome: 'ERIC VINICIUS PIRES DE CARVALHO', nomeGuerra: 'ERIC VINICIUS', posto: 'SGT1', funcao: 'Chefe da Base' },
    { re: '971475', digito: '8', nome: 'ANTONIO MARIANO JUNIOR', nomeGuerra: 'MARIANO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '981202', digito: '4', nome: 'EVALDO DOS REIS', nomeGuerra: 'EVALDO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101530', digito: '3', nome: 'MARCELO APARECIDO MOREIRA CUNHA', nomeGuerra: 'MARCELO CUNHA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '112881', digito: '7', nome: 'JOÃO BOSCO DA SILVA', nomeGuerra: 'JOÃO BOSCO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '112938', digito: '4', nome: 'ROBERTO MOREIRA DE FRANÇA', nomeGuerra: 'ROBERTO MOREIRA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '113129', digito: '0', nome: 'MARCELO VARGAS', nomeGuerra: 'VARGAS', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '121127', digito: '7', nome: 'ALEXANDRE DE ALMEIDA SILVA', nomeGuerra: 'ALEXANDRE ALMEIDA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '124398', digito: '5', nome: 'BRUNO MARQUES BARBOZA DA SILVA', nomeGuerra: 'BRUNO MARQUES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '145249', digito: '5', nome: 'WAGNER MOURA DOS REIS', nomeGuerra: 'WAGNER MOURA', posto: 'CB', funcao: 'Patrulheiro' },
  ];

  // =============================================
  // GP TÁT AMB (subunidadeId: 6)
  // =============================================
  const gpTatAmb = [
    { re: '115388', digito: '9', nome: 'JULIANO CÉSAR SILVA DO NASCIMENTO', nomeGuerra: 'JULIANO CÉSAR', posto: 'SGT1', funcao: 'Chefe do GP TÁT' },
    { re: '115360', digito: '9', nome: 'KLEVERTON LUIZ DE CAMPOS', nomeGuerra: 'KLEVERTON', posto: 'SGT1', funcao: 'Adjunto' },
    { re: '134061', digito: '1', nome: 'JOSÉ LUIZ DA SILVA VIDAL', nomeGuerra: 'JOSÉ VIDAL', posto: 'CB', funcao: 'Patrulheiro Tático' },
    { re: '129537', digito: '3', nome: 'AMADEU GODOY MOREIRA', nomeGuerra: 'AMADEU GODOY', posto: 'CB', funcao: 'Patrulheiro Tático' },
    { re: '133060', digito: '8', nome: 'JEAN FELIPE DIAS PAULA', nomeGuerra: 'JEAN FELIPE', posto: 'CB', funcao: 'Patrulheiro Tático' },
    { re: '133471', digito: '9', nome: 'LUIS RICARDO DA SILVA SANTOS', nomeGuerra: 'LUIS RICARDO', posto: 'CB', funcao: 'Patrulheiro Tático' },
    { re: '143451', digito: '9', nome: 'ANDERSON FERNANDO CAVALCA', nomeGuerra: 'ANDERSON CAVALCA', posto: 'CB', funcao: 'Patrulheiro Tático' },
  ];

  // =============================================
  // 3º PELOTÃO PAMB - SÃO JOSÉ DOS CAMPOS (subunidadeId: 7)
  // =============================================
  const pelotao3Sede = [
    { re: '113127', digito: '3', nome: 'WILLIANS MENDES FRANCISCO', nomeGuerra: 'WILLIANS MENDES', posto: 'SGT1', funcao: 'Comandante Interino' },
    { re: '110940', digito: '5', nome: 'THIAGO DE SOUZA SARMENTO', nomeGuerra: 'THIAGO SARMENTO', posto: 'SGT1', funcao: 'Adjunto' },
    { re: '115489', digito: '3', nome: 'ALTAMIRO CANDIDO JUNIOR', nomeGuerra: 'ALTAMIRO', posto: 'SGT2', funcao: 'Auxiliar Administrativo' },
    { re: '101052', digito: '2', nome: 'MARCIO PRADO DOS SANTOS', nomeGuerra: 'MARCIO PRADO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '101490', digito: 'A', nome: 'JEAN PAULO CASSIANO DE SOUZA', nomeGuerra: 'JEAN PAULO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '113109', digito: '5', nome: 'FERNANDO LUIZ SANTANA', nomeGuerra: 'FERNANDO SANTANA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '115767', digito: '1', nome: 'RENATO DE ARAUJO', nomeGuerra: 'RENATO ARAUJO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '111281', digito: '1', nome: 'RODRIGO ALCANTARA', nomeGuerra: 'ALCANTARA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '113003', digito: '0', nome: 'IGOR OLIVEIRA DO PRADO', nomeGuerra: 'IGOR PRADO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '129539', digito: '0', nome: 'ANDERSON BARBOSA TEIXEIRA PAES', nomeGuerra: 'ANDERSON PAES', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '130055', digito: '5', nome: 'VAGNER DE SOUZA CARDOSO', nomeGuerra: 'VAGNER CARDOSO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '132845', digito: '0', nome: 'SAULO RICARDO DE ALMEIDA', nomeGuerra: 'SAULO RICARDO', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '181218', digito: '1', nome: 'ANA CLARA VILHENA DE BRITO', nomeGuerra: 'ANA CLARA', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '190863', digito: '4', nome: 'EDUARDO OTERI FACADIO DE MELO', nomeGuerra: 'EDUARDO OTERI', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '146693', digito: '3', nome: 'BRENO VARGAS DA SILVA', nomeGuerra: 'BRENO VARGAS', posto: 'CB', funcao: 'Patrulheiro' },
    { re: '143721', digito: '6', nome: 'RAFAEL ARENA DARTORA', nomeGuerra: 'RAFAEL DARTORA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '153092', digito: '5', nome: 'THIAGO DOMINGOS LEAL', nomeGuerra: 'THIAGO LEAL', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '161429', digito: 'A', nome: 'DANILO DE SIQUEIRA CAMPOS', nomeGuerra: 'DANILO SIQUEIRA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '192464', digito: '8', nome: 'MARIA ANGÉLICA DE LIMA', nomeGuerra: 'MARIA ANGÉLICA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '194777', digito: '0', nome: 'JOSÉ GUSTAVO ATAÍDE DE MELO', nomeGuerra: 'JOSÉ GUSTAVO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '201649', digito: '4', nome: 'VAGNER MEGDA VEDOVATTO', nomeGuerra: 'VAGNER MEGDA', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '202003', digito: '3', nome: 'LUIZ PAULO PEIXOTO MEDEIROS', nomeGuerra: 'LUIZ PAULO', posto: 'SD', funcao: 'Patrulheiro' },
    { re: '231051', digito: '1', nome: 'DAVI PASQUOTO SANTOS', nomeGuerra: 'DAVI PASQUOTO', posto: 'SD', funcao: 'Patrulheiro' },
  ];

  // Criar todos os policiais
  const todosOsPoliciais = [
    ...secaoComando.map(p => ({ ...p, subunidadeId: 1 })),
    ...pelotao1Sede.map(p => ({ ...p, subunidadeId: 2 })),
    ...bopCamposJordao.map(p => ({ ...p, subunidadeId: 3 })),
    ...pelotao2Sede.map(p => ({ ...p, subunidadeId: 4 })),
    ...bopCruzeiro.map(p => ({ ...p, subunidadeId: 5 })),
    ...gpTatAmb.map(p => ({ ...p, subunidadeId: 6 })),
    ...pelotao3Sede.map(p => ({ ...p, subunidadeId: 7 })),
  ];

  const policiais = [];
  for (const p of todosOsPoliciais) {
    const policial = await prisma.policial.upsert({
      where: { re: p.re },
      update: {
        nome: p.nome,
        nomeGuerra: p.nomeGuerra,
        posto: p.posto as any,
        funcao: p.funcao,
        subunidadeId: p.subunidadeId,
      },
      create: {
        re: p.re,
        digito: p.digito,
        nome: p.nome,
        nomeGuerra: p.nomeGuerra,
        posto: p.posto as any,
        funcao: p.funcao,
        subunidadeId: p.subunidadeId,
        criadoPorUsuario: 'SEED'
      }
    });
    policiais.push(policial);
  }
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

  console.log('✅ Seed concluído com sucesso!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                 RESUMO DO EFETIVO                     ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   📅 Última atualização: ${DATA_ULTIMA_ATUALIZACAO}`);
  console.log(`   👮 Total de policiais: ${policiais.length}`);
  console.log('');
  console.log('   Por graduação:');
  console.log(`      • Capitão PM: 1`);
  console.log(`      • Tenentes PM: 2`);
  console.log(`      • Subtenentes/Sargentos PM: 10`);
  console.log(`      • Cabos/Soldados PM: 86`);
  console.log('');
  console.log(`   🚗 Viaturas: ${viaturas.length}`);
  console.log(`   📦 Materiais: ${materiais.length}`);
  console.log(`   📍 Subunidades: ${subunidades.length}`);
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
