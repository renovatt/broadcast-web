import { describe, expect, it } from 'vitest';
import { connectionSchema } from '../schemas/connection-schemas';

describe('connectionSchema', () => {
  it('aceita um nome e remove espaços nas pontas', () => {
    const result = connectionSchema.safeParse({ name: '  Vendas  ' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Vendas');
  });

  it('exige nome (só espaços não vale)', () => {
    const result = connectionSchema.safeParse({ name: '   ' });
    expect(result.error?.issues[0]?.message).toBe('Informe o nome da conexão.');
  });

  it('limita a 80 caracteres', () => {
    const result = connectionSchema.safeParse({ name: 'x'.repeat(81) });
    expect(result.error?.issues[0]?.message).toBe('Máximo de 80 caracteres.');
  });
});
