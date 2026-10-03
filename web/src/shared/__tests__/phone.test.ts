import { describe, expect, it } from 'vitest';
import { formatPhone, formatPhoneNational, isValidPhone, normalizePhone } from '../utils/phone';

describe('normalizePhone', () => {
  it.each([
    ['(11) 99999-8888', '+5511999998888'],
    ['11 3333-4444', '+551133334444'],
    ['11999998888', '+5511999998888'],
    ['5511999998888', '+5511999998888'],
    ['+55 (11) 99999-8888', '+5511999998888'],
    ['+1 (415) 555-2671', '+14155552671'],
    ['  +351 912 345 678 ', '+351912345678'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});

describe('isValidPhone', () => {
  it('aceita E.164 com 8 a 15 dígitos', () => {
    expect(isValidPhone('+5511999998888')).toBe(true);
    expect(isValidPhone('+14155552671')).toBe(true);
  });

  it.each(['5511999998888', '+0511999998888', '+1234567', '+1234567890123456', '+55 11 9999'])(
    'rejeita %s',
    (phone) => {
      expect(isValidPhone(phone)).toBe(false);
    },
  );

  it.each(['9999-8888', '999998888', '123456789012', '+55 11 9999'])(
    'sem "+", só aceita número brasileiro completo: %s é inválido',
    (input) => {
      expect(isValidPhone(normalizePhone(input))).toBe(false);
    },
  );
});

describe('formatPhone', () => {
  it('formata celular e fixo brasileiros', () => {
    expect(formatPhone('+5511999998888')).toBe('+55 11 99999-8888');
    expect(formatPhone('+551133334444')).toBe('+55 11 3333-4444');
  });

  it('mantém outros países em E.164', () => {
    expect(formatPhone('+14155552671')).toBe('+14155552671');
  });

  it('o formato exibido volta ao mesmo E.164', () => {
    expect(normalizePhone(formatPhone('+5511999998888'))).toBe('+5511999998888');
  });
});

describe('formatPhoneNational', () => {
  it('usa o formato da máscara para números brasileiros', () => {
    expect(formatPhoneNational('+5511999998888')).toBe('(11) 99999-8888');
    expect(formatPhoneNational('+551133334444')).toBe('(11) 3333-4444');
  });

  it('mantém outros países em E.164', () => {
    expect(formatPhoneNational('+14155552671')).toBe('+14155552671');
  });

  it('volta ao mesmo E.164 ao normalizar', () => {
    expect(normalizePhone(formatPhoneNational('+5511999998888'))).toBe('+5511999998888');
  });
});
