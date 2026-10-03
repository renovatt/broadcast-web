import { describe, expect, it } from 'vitest';
import { summarizeRecipients, toRecipients } from '../utils/recipients';
import { contacts } from './fixtures';

describe('toRecipients', () => {
  it('monta o snapshot (id, nome, telefone) dos selecionados, na ordem da lista', () => {
    expect(toRecipients(contacts, ['k3', 'k1'])).toEqual([
      { id: 'k1', name: 'Ana', phone: '+5511911110001' },
      { id: 'k3', name: 'Carla', phone: '+5511911110003' },
    ]);
  });

  it('ignora ids de contatos que não existem mais', () => {
    expect(toRecipients(contacts, ['k2', 'apagado'])).toEqual([
      { id: 'k2', name: 'Bruno', phone: '+5511911110002' },
    ]);
  });
});

describe('summarizeRecipients', () => {
  const people = (...names: string[]) =>
    names.map((name, index) => ({ id: String(index), name, phone: '' }));

  it.each([
    [[], ''],
    [['Ana'], 'Ana'],
    [['Ana', 'Bruno'], 'Ana e Bruno'],
    [['Ana', 'Bruno', 'Carla'], 'Ana, Bruno e mais 1'],
    [['Ana', 'Bruno', 'Carla', 'Davi', 'Eva'], 'Ana, Bruno e mais 3'],
  ])('%j → "%s"', (names, expected) => {
    expect(summarizeRecipients(people(...names))).toBe(expected);
  });
});
