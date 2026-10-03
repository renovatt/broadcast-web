import { describe, expect, it } from 'vitest';
import type { Message } from '../types/message';
import { countByStatus, filterMessages } from '../utils/message-filters';
import { scheduledMessage, sentMessage, timestamp } from './fixtures';

const at = (day: number) => timestamp(new Date(2030, 0, day));

const messages = [
  { ...sentMessage, id: 's-old', createdAt: at(1), sentAt: at(1) },
  { ...scheduledMessage, id: 'a-far', createdAt: at(2), scheduledAt: at(20) },
  { ...sentMessage, id: 's-new', createdAt: at(3), sentAt: at(3) },
  { ...scheduledMessage, id: 'a-soon', createdAt: at(4), scheduledAt: at(10) },
] as Message[];

const ids = (list: Message[]) => list.map(({ id }) => id);

describe('filterMessages', () => {
  it('Todas: mais recentes primeiro pela criação', () => {
    expect(ids(filterMessages(messages, 'all'))).toEqual(['a-soon', 's-new', 'a-far', 's-old']);
  });

  it('Enviadas: envio mais recente primeiro', () => {
    expect(ids(filterMessages(messages, 'sent'))).toEqual(['s-new', 's-old']);
  });

  it('Agendadas: próximo envio primeiro', () => {
    expect(ids(filterMessages(messages, 'scheduled'))).toEqual(['a-soon', 'a-far']);
  });

  it('não altera a lista original', () => {
    const before = ids(messages);
    filterMessages(messages, 'all');
    expect(ids(messages)).toEqual(before);
  });
});

describe('countByStatus', () => {
  it('conta todas, enviadas e agendadas', () => {
    expect(countByStatus(messages)).toEqual({ all: 4, sent: 2, scheduled: 2 });
    expect(countByStatus([])).toEqual({ all: 0, sent: 0, scheduled: 0 });
  });
});
