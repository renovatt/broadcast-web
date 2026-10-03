import { describe, expect, it } from 'vitest';
import { createContactSchema } from '../schemas/contact-schemas';

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? [];

describe('createContactSchema', () => {
  it('normaliza nome e telefone', () => {
    const result = createContactSchema().safeParse({
      name: '  Maria  ',
      phone: '(11) 99999-8888',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Maria', phone: '+5511999998888' });
  });

  it('exige nome e telefone', () => {
    const result = createContactSchema().safeParse({ name: ' ', phone: '' });
    expect(messages(result)).toEqual(['Informe o nome do contato.', 'Informe o telefone.']);
  });

  it('limita o nome a 80 caracteres', () => {
    const result = createContactSchema().safeParse({ name: 'x'.repeat(81), phone: '11999998888' });
    expect(messages(result)).toContain('Máximo de 80 caracteres.');
  });

  it('rejeita telefone inválido', () => {
    const result = createContactSchema().safeParse({ name: 'Maria', phone: '9999-8888' });
    expect(messages(result)).toEqual([
      'Telefone inválido. Use DDD + número, ex.: (11) 99999-8888.',
    ]);
  });

  it('rejeita telefone já usado na conexão, mesmo digitado em outro formato', () => {
    const schema = createContactSchema(['+5511999998888']);
    const result = schema.safeParse({ name: 'Outra', phone: '11 99999 8888' });
    expect(messages(result)).toEqual(['Já existe um contato com este telefone nesta conexão.']);
  });

  it('aceita telefone que não está na lista de usados', () => {
    const schema = createContactSchema(['+5511999998888']);
    expect(schema.safeParse({ name: 'Outra', phone: '11 98888 7777' }).success).toBe(true);
  });
});
