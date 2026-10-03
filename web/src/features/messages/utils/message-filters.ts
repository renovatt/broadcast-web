import type { Message, MessageStatus } from '../types/message';

export type MessageFilter = 'all' | MessageStatus;

const millis = (value: Message['createdAt'] | null) => value?.toMillis() ?? 0;

/**
 * Filtra e ordena conforme a aba:
 * - Todas: mais recentes primeiro (criação);
 * - Enviadas: envio mais recente primeiro;
 * - Agendadas: próximo envio primeiro.
 */
export const filterMessages = (messages: readonly Message[], filter: MessageFilter): Message[] => {
  if (filter === 'all') {
    return [...messages].sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
  }
  const filtered = messages.filter((message) => message.status === filter);
  return filter === 'sent'
    ? filtered.sort((a, b) => millis(b.sentAt) - millis(a.sentAt))
    : filtered.sort((a, b) => millis(a.scheduledAt) - millis(b.scheduledAt));
};

export const countByStatus = (messages: readonly Message[]): Record<MessageFilter, number> => ({
  all: messages.length,
  sent: messages.filter(({ status }) => status === 'sent').length,
  scheduled: messages.filter(({ status }) => status === 'scheduled').length,
});
