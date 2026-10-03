import { describe, expect, it } from 'vitest';
import type { Contact } from '../types/contact';
import { filterContacts } from '../utils/filter-contacts';

const contacts = [
  { id: '1', name: 'José Álvares', phone: '+5511999998888' },
  { id: '2', name: 'Maria Silva', phone: '+5521988887777' },
  { id: '3', name: 'Ana', phone: '+14155552671' },
] as Contact[];

const ids = (list: Contact[]) => list.map(({ id }) => id);

describe('filterContacts', () => {
  it('sem termo devolve todos (cópia)', () => {
    const result = filterContacts(contacts, '  ');
    expect(ids(result)).toEqual(['1', '2', '3']);
    expect(result).not.toBe(contacts);
  });

  it('busca por nome ignorando acentos e maiúsculas', () => {
    expect(ids(filterContacts(contacts, 'jose alv'))).toEqual(['1']);
    expect(ids(filterContacts(contacts, 'SILVA'))).toEqual(['2']);
  });

  it('busca por dígitos do telefone, ignorando a formatação digitada', () => {
    expect(ids(filterContacts(contacts, '(21) 98888'))).toEqual(['2']);
    expect(ids(filterContacts(contacts, '415'))).toEqual(['3']);
  });

  it('retorna vazio quando nada corresponde', () => {
    expect(filterContacts(contacts, 'zzz')).toEqual([]);
  });
});
