import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { messageSchema } from '../schemas/message-schemas';

const valid = {
  recipientIds: ['k1'],
  body: 'Olá!',
  mode: 'now' as const,
  scheduledAt: null,
};

const messages = (input: unknown) =>
  messageSchema.safeParse(input).error?.issues.map(({ message }) => message) ?? [];

describe('messageSchema', () => {
  it('aceita envio imediato e remove espaços do texto', () => {
    const result = messageSchema.safeParse({ ...valid, body: '  Olá!  ' });
    expect(result.success).toBe(true);
    expect(result.data?.body).toBe('Olá!');
  });

  it('exige destinatários e texto', () => {
    expect(messages({ ...valid, recipientIds: [], body: ' ' })).toEqual([
      'Selecione pelo menos um contato.',
      'Escreva a mensagem.',
    ]);
  });

  it('limita texto a 1000 caracteres e destinatários a 500', () => {
    expect(messages({ ...valid, body: 'x'.repeat(1001) })).toEqual(['Máximo de 1000 caracteres.']);
    const many = Array.from({ length: 501 }, (_, index) => `k${index}`);
    expect(messages({ ...valid, recipientIds: many })).toEqual(['Máximo de 500 destinatários.']);
  });

  it('agendamento exige data', () => {
    expect(messages({ ...valid, mode: 'schedule', scheduledAt: null })).toEqual([
      'Escolha a data e o horário do envio.',
    ]);
  });

  it('agendamento rejeita data inválida, passada ou a menos de 1 minuto', () => {
    const error = 'Escolha um horário pelo menos 1 minuto no futuro.';
    expect(messages({ ...valid, mode: 'schedule', scheduledAt: dayjs('invalid') })).toEqual([
      'Escolha a data e o horário do envio.',
    ]);
    expect(
      messages({ ...valid, mode: 'schedule', scheduledAt: dayjs().subtract(1, 'hour') }),
    ).toEqual([error]);
    expect(
      messages({ ...valid, mode: 'schedule', scheduledAt: dayjs().add(20, 'second') }),
    ).toEqual([error]);
  });

  it('aceita agendamento no futuro', () => {
    const result = messageSchema.safeParse({
      ...valid,
      mode: 'schedule',
      scheduledAt: dayjs().add(1, 'day'),
    });
    expect(result.success).toBe(true);
  });

  it('ignora a data quando o envio é imediato', () => {
    expect(
      messageSchema.safeParse({ ...valid, scheduledAt: dayjs().subtract(1, 'day') }).success,
    ).toBe(true);
  });
});
