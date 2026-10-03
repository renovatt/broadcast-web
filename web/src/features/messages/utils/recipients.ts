import type { Contact } from '@/features/contacts/types/contact';
import type { Recipient } from '../types/message';

/** Destinatários (snapshot) dos contatos selecionados que ainda existem, na ordem da lista. */
export const toRecipients = (contacts: readonly Contact[], selectedIds: readonly string[]) => {
  const selected = new Set(selectedIds);
  return contacts
    .filter(({ id }) => selected.has(id))
    .map(({ id, name, phone }): Recipient => ({ id, name, phone }));
};

/** "Maria", "Maria e João", "Maria, João e mais 3". */
export const summarizeRecipients = (recipients: readonly Recipient[], visible = 2) => {
  const names = recipients.map(({ name }) => name);
  if (names.length <= visible) {
    return names.length === 2 ? `${names[0]} e ${names[1]}` : (names[0] ?? '');
  }
  const rest = names.length - visible;
  return `${names.slice(0, visible).join(', ')} e mais ${rest}`;
};
