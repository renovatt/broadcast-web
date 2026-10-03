import { beforeEach, describe, expect, it } from 'vitest';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import {
  activeFields,
  clearEmulator,
  emulatorDb,
  minutesFromNow,
} from '../../../test-utils/firestore-emulator';
import { refreshConnectionStats } from '../refresh-connection-stats';

const db = emulatorDb();

const connection = { tenantId: 'u1', name: 'Vendas', ...activeFields() };

const contact = (connectionId = 'c1', overrides: DocumentData = {}) => ({
  tenantId: 'u1',
  connectionId,
  name: 'Ana',
  phone: '+5511911110001',
  ...activeFields(),
  ...overrides,
});

const message = (status: 'sent' | 'scheduled', overrides: DocumentData = {}) => ({
  tenantId: 'u1',
  connectionId: 'c1',
  body: 'Oi',
  recipientIds: ['k1'],
  recipients: [{ id: 'k1', name: 'Ana', phone: '+5511911110001' }],
  status,
  scheduledAt: status === 'scheduled' ? minutesFromNow(60) : null,
  sentAt: status === 'sent' ? Timestamp.now() : null,
  ...activeFields(),
  ...overrides,
});

const disabled = { enabled: false, deletedAt: Timestamp.now() };

beforeEach(async () => {
  await clearEmulator();
  await db.doc('connections/c1').set(connection);
});

describe('refreshConnectionStats', () => {
  it('conta contatos, enviadas e agendadas ativos e grava em stats', async () => {
    await db.doc('contacts/a').set(contact());
    await db.doc('contacts/b').set(contact());
    await db.doc('messages/s1').set(message('sent'));
    await db.doc('messages/s2').set(message('sent'));
    await db.doc('messages/s3').set(message('sent'));
    await db.doc('messages/a1').set(message('scheduled'));

    const stats = await refreshConnectionStats(db, 'c1');

    expect(stats).toEqual({ contacts: 2, sent: 3, scheduled: 1 });
    const stored = (await db.doc('connections/c1').get()).data();
    expect(stored?.stats).toEqual({ contacts: 2, sent: 3, scheduled: 1 });
    expect(stored?.statsUpdatedAt).toBeInstanceOf(Timestamp);
  });

  it('ignora itens desativados (soft delete) e de outras conexões', async () => {
    await db.doc('contacts/a').set(contact());
    await db.doc('contacts/deleted').set(contact('c1', disabled));
    await db.doc('contacts/other').set(contact('c2'));
    await db.doc('messages/deleted').set(message('sent', disabled));
    await db.doc('messages/other').set(message('scheduled', { connectionId: 'c2' }));

    expect(await refreshConnectionStats(db, 'c1')).toEqual({ contacts: 1, sent: 0, scheduled: 0 });
  });

  it('é idempotente: recalcular de novo dá o mesmo resultado', async () => {
    await db.doc('contacts/a').set(contact());
    const first = await refreshConnectionStats(db, 'c1');
    const second = await refreshConnectionStats(db, 'c1');
    expect(second).toEqual(first);
  });

  it('acompanha mudanças: agendada que vira enviada', async () => {
    await db.doc('messages/a1').set(message('scheduled'));
    expect(await refreshConnectionStats(db, 'c1')).toEqual({ contacts: 0, sent: 0, scheduled: 1 });

    await db.doc('messages/a1').update({ status: 'sent', sentAt: Timestamp.now() });
    expect(await refreshConnectionStats(db, 'c1')).toEqual({ contacts: 0, sent: 1, scheduled: 0 });
  });

  it('não altera o updatedAt nem o nome da conexão', async () => {
    const before = (await db.doc('connections/c1').get()).data();
    await refreshConnectionStats(db, 'c1');
    const after = (await db.doc('connections/c1').get()).data();
    expect(after?.updatedAt).toEqual(before?.updatedAt);
    expect(after?.name).toBe('Vendas');
  });

  it('retorna null e não cria documento quando a conexão não existe', async () => {
    expect(await refreshConnectionStats(db, 'inexistente')).toBeNull();
    expect((await db.doc('connections/inexistente').get()).exists).toBe(false);
  });
});
