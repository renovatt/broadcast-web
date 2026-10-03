import { describe, expect, it } from 'vitest';
import { affectsStats, connectionIdOf } from '../affects-stats';

const active = { enabled: true, status: 'scheduled', connectionId: 'c1', body: 'Oi' };

describe('affectsStats', () => {
  it.each([
    ['criação', undefined, active],
    ['remoção física', active, undefined],
    ['soft delete', active, { ...active, enabled: false }],
    ['agendada → enviada', active, { ...active, status: 'sent' }],
  ])('recalcula em %s', (_, before, after) => {
    expect(affectsStats(before, after)).toBe(true);
  });

  it.each([
    ['edição de texto', active, { ...active, body: 'Novo texto' }],
    [
      'edição de nome/telefone de contato',
      { enabled: true, name: 'A' },
      { enabled: true, name: 'B' },
    ],
    ['evento sem dados', undefined, undefined],
  ])('não recalcula em %s', (_, before, after) => {
    expect(affectsStats(before, after)).toBe(false);
  });
});

describe('connectionIdOf', () => {
  it('usa o documento novo e, na remoção, o antigo', () => {
    expect(connectionIdOf(undefined, { connectionId: 'c2' })).toBe('c2');
    expect(connectionIdOf({ connectionId: 'c1' }, undefined)).toBe('c1');
    expect(connectionIdOf(undefined, undefined)).toBeUndefined();
  });
});
