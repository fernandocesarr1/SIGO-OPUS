/**
 * SIGO - Testes de tipos e utilitários de Personnel
 */

import { describe, it, expect } from 'vitest';
import {
  ORDEM_POSTO,
  OPM_ESTRUTURA,
  ordenarPorAntiguidade,
  type Policial,
} from '../../types/personnel';
import { StatusOperacional } from '../../types';

describe('ORDEM_POSTO', () => {
  it('deve ter hierarquia correta de postos', () => {
    expect(ORDEM_POSTO['CAP']).toBe(9);
    expect(ORDEM_POSTO['1TEN']).toBe(8);
    expect(ORDEM_POSTO['2TEN']).toBe(7);
    expect(ORDEM_POSTO['SUBTEN']).toBe(6);
    expect(ORDEM_POSTO['1SGT']).toBe(5);
    expect(ORDEM_POSTO['2SGT']).toBe(4);
    expect(ORDEM_POSTO['3SGT']).toBe(3);
    expect(ORDEM_POSTO['CB']).toBe(2);
    expect(ORDEM_POSTO['SD']).toBe(1);
  });

  it('CAP deve ser maior que todos os outros', () => {
    Object.keys(ORDEM_POSTO).forEach((posto) => {
      if (posto !== 'CAP') {
        expect(ORDEM_POSTO['CAP']).toBeGreaterThan(ORDEM_POSTO[posto as keyof typeof ORDEM_POSTO]);
      }
    });
  });

  it('SD deve ser menor que todos os outros', () => {
    Object.keys(ORDEM_POSTO).forEach((posto) => {
      if (posto !== 'SD') {
        expect(ORDEM_POSTO['SD']).toBeLessThan(ORDEM_POSTO[posto as keyof typeof ORDEM_POSTO]);
      }
    });
  });
});

describe('OPM_ESTRUTURA', () => {
  it('deve ter estrutura da 4ª Cia', () => {
    expect(OPM_ESTRUTURA['4ª Cia']).toBeDefined();
    expect(OPM_ESTRUTURA['4ª Cia'].nome).toBe('4ª Companhia - Sede Administrativa');
    expect(OPM_ESTRUTURA['4ª Cia'].subordinados).toContain('P/1');
    expect(OPM_ESTRUTURA['4ª Cia'].subordinados).toContain('P/3');
    expect(OPM_ESTRUTURA['4ª Cia'].subordinados).toContain('P/4');
  });

  it('deve ter estrutura dos pelotões', () => {
    expect(OPM_ESTRUTURA['1º Pel']).toBeDefined();
    expect(OPM_ESTRUTURA['2º Pel']).toBeDefined();
    expect(OPM_ESTRUTURA['3º Pel']).toBeDefined();
  });

  it('1º Pel deve ter BOp Campos do Jordão como subordinado', () => {
    expect(OPM_ESTRUTURA['1º Pel'].subordinados).toContain('BOp Campos do Jordão');
  });

  it('2º Pel deve ter BOp Cruzeiro como subordinado', () => {
    expect(OPM_ESTRUTURA['2º Pel'].subordinados).toContain('BOp Cruzeiro');
  });
});

describe('ordenarPorAntiguidade', () => {
  const criarPolicial = (overrides: Partial<Policial>): Policial => ({
    id: 1,
    re: '123.456-7',
    posto: 'SD',
    nomeGuerra: 'TESTE',
    nomeCompleto: 'Fulano de Teste',
    funcao: 'Patrulheiro',
    pelotao: '1ª Equipe',
    subunidade: '1º Pel',
    status: StatusOperacional.APTO,
    ...overrides,
  });

  it('deve ordenar por posto (maior primeiro)', () => {
    const cap = criarPolicial({ id: 1, posto: 'CAP' });
    const sd = criarPolicial({ id: 2, posto: 'SD' });
    const sgt = criarPolicial({ id: 3, posto: '1SGT' });

    const ordenado = [sd, sgt, cap].sort(ordenarPorAntiguidade);

    expect(ordenado[0].posto).toBe('CAP');
    expect(ordenado[1].posto).toBe('1SGT');
    expect(ordenado[2].posto).toBe('SD');
  });

  it('mesmo posto: ordenar por data de promoção (mais antigo primeiro)', () => {
    const sgt1 = criarPolicial({
      id: 1,
      posto: '1SGT',
      dataPromocao: '2020-01-01',
    });
    const sgt2 = criarPolicial({
      id: 2,
      posto: '1SGT',
      dataPromocao: '2022-01-01',
    });
    const sgt3 = criarPolicial({
      id: 3,
      posto: '1SGT',
      dataPromocao: '2018-01-01',
    });

    const ordenado = [sgt2, sgt1, sgt3].sort(ordenarPorAntiguidade);

    expect(ordenado[0].dataPromocao).toBe('2018-01-01');
    expect(ordenado[1].dataPromocao).toBe('2020-01-01');
    expect(ordenado[2].dataPromocao).toBe('2022-01-01');
  });

  it('SD: ordenar por data de ingresso (mais antigo primeiro)', () => {
    const sd1 = criarPolicial({
      id: 1,
      posto: 'SD',
      dataIngresso: '2020-06-01',
    });
    const sd2 = criarPolicial({
      id: 2,
      posto: 'SD',
      dataIngresso: '2022-01-01',
    });
    const sd3 = criarPolicial({
      id: 3,
      posto: 'SD',
      dataIngresso: '2019-03-15',
    });

    const ordenado = [sd2, sd1, sd3].sort(ordenarPorAntiguidade);

    expect(ordenado[0].dataIngresso).toBe('2019-03-15');
    expect(ordenado[1].dataIngresso).toBe('2020-06-01');
    expect(ordenado[2].dataIngresso).toBe('2022-01-01');
  });

  it('deve lidar com datas ausentes', () => {
    const sgt1 = criarPolicial({ id: 1, posto: '1SGT', dataPromocao: undefined });
    const sgt2 = criarPolicial({ id: 2, posto: '1SGT', dataPromocao: '2020-01-01' });

    // Não deve lançar erro
    expect(() => [sgt1, sgt2].sort(ordenarPorAntiguidade)).not.toThrow();
  });

  it('ordenação completa com múltiplos postos', () => {
    const policiais = [
      criarPolicial({ id: 1, posto: 'SD', dataIngresso: '2023-01-01' }),
      criarPolicial({ id: 2, posto: 'CAP', dataPromocao: '2020-01-01' }),
      criarPolicial({ id: 3, posto: '2SGT', dataPromocao: '2019-01-01' }),
      criarPolicial({ id: 4, posto: 'CB', dataPromocao: '2021-01-01' }),
      criarPolicial({ id: 5, posto: '2SGT', dataPromocao: '2018-01-01' }),
    ];

    const ordenado = [...policiais].sort(ordenarPorAntiguidade);

    // CAP primeiro, depois os 2SGT por antiguidade, CB, SD
    expect(ordenado[0].id).toBe(2); // CAP
    expect(ordenado[1].id).toBe(5); // 2SGT (2018)
    expect(ordenado[2].id).toBe(3); // 2SGT (2019)
    expect(ordenado[3].id).toBe(4); // CB
    expect(ordenado[4].id).toBe(1); // SD
  });
});
