import type { Contact } from '../types/contact';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Busca local por nome (sem acentos/maiúsculas) ou por dígitos do telefone. */
export const filterContacts = (contacts: readonly Contact[], search: string) => {
  const term = normalizeText(search);
  if (!term) return [...contacts];
  const digits = term.replace(/\D/g, '');
  return contacts.filter(
    (contact) =>
      normalizeText(contact.name).includes(term) ||
      (digits.length > 0 && contact.phone.includes(digits)),
  );
};
