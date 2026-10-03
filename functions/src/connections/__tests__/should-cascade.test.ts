import { describe, expect, it } from 'vitest';
import { shouldCascade } from '../should-cascade';

describe('shouldCascade', () => {
  it('roda quando a conexão passa de ativa para desativada', () => {
    expect(shouldCascade({ enabled: true }, { enabled: false })).toBe(true);
  });

  it.each([
    ['renomear (continua ativa)', { enabled: true }, { enabled: true }],
    ['update em conexão já desativada', { enabled: false }, { enabled: false }],
    ['reativação', { enabled: false }, { enabled: true }],
    ['documento sem before', undefined, { enabled: false }],
    ['documento sem after', { enabled: true }, undefined],
  ])('não roda: %s', (_, before, after) => {
    expect(shouldCascade(before, after)).toBe(false);
  });
});
