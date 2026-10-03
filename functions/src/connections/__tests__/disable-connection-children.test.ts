import { beforeEach, describe, expect, it } from 'vitest';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import {
  activeFields,
  clearEmulator,
  emulatorDb,
  minutesFromNow,
} from '../../../test-utils/firestore-emulator';
import { dispatchDueMessages } from '../../messages/dispatch-due-messages';
import { disableConnectionChildren } from '../disable-connection-children';

const db = emulatorDb();

const contact = (connectionId: string, tenantId = 'u1', overrides: DocumentData = {}) => ({
  tenantId,
  connectionId,
  name: 'Ana',
  phone: '+5511911110001',
  ...activeFields(),
  ...overrides,
});

const message = (connectionId: string, tenantId = 'u1', overrides: DocumentData = {}) => ({
  tenantId,
  connectionId,
  body: 'Oi',
  recipientIds: ['k1'],
  recipients: [{ id: 'k1', name: 'Ana', phone: '+5511911110001' }],
  status: 'scheduled',
  scheduledAt: minutesFromNow(-1),
  sentAt: null,
  ...activeFields(),
  ...overrides,
});

const read = async (path: string) => (await db.doc(path).get()).data();

beforeEach(async () => {
  await clearEmulator();
});

describe('disableConnectionChildren', () => {
  it('desativa contatos e mensagens da conexão com o mesmo deletedAt', async () => {
    await db.doc('contacts/a').set(contact('c1'));
    await db.doc('contacts/b').set(contact('c1'));
    await db.doc('messages/m').set(message('c1'));
    const deletedAt = Timestamp.fromDate(new Date('2026-10-03T12:00:00Z'));

    const counts = await disableConnectionChildren(db, {
      connectionId: 'c1',
      tenantId: 'u1',
      deletedAt,
    });

    expect(counts).toEqual({ contacts: 2, messages: 1 });
    for (const path of ['contacts/a', 'contacts/b', 'messages/m']) {
      const data = await read(path);
      expect(data?.enabled).toBe(false);
      expect(data?.deletedAt).toEqual(deletedAt);
    }
  });

  it('nada é apagado: os documentos continuam existindo com os dados originais', async () => {
    await db.doc('contacts/a').set(contact('c1'));
    await disableConnectionChildren(db, {
      connectionId: 'c1',
      tenantId: 'u1',
      deletedAt: Timestamp.now(),
    });
    expect(await read('contacts/a')).toMatchObject({ name: 'Ana', phone: '+5511911110001' });
  });

  it('não toca em outras conexões nem em outros clientes', async () => {
    await db.doc('contacts/other-connection').set(contact('c2'));
    await db.doc('contacts/other-tenant').set(contact('c1', 'u2'));
    await db.doc('messages/other-connection').set(message('c2'));

    const counts = await disableConnectionChildren(db, {
      connectionId: 'c1',
      tenantId: 'u1',
      deletedAt: Timestamp.now(),
    });

    expect(counts).toEqual({ contacts: 0, messages: 0 });
    expect((await read('contacts/other-connection'))?.enabled).toBe(true);
    expect((await read('contacts/other-tenant'))?.enabled).toBe(true);
    expect((await read('messages/other-connection'))?.enabled).toBe(true);
  });

  it('preserva o deletedAt de itens que já estavam desativados (idempotente)', async () => {
    const earlier = Timestamp.fromDate(new Date('2026-01-01T00:00:00Z'));
    await db.doc('contacts/old').set(contact('c1', 'u1', { enabled: false, deletedAt: earlier }));

    const counts = await disableConnectionChildren(db, {
      connectionId: 'c1',
      tenantId: 'u1',
      deletedAt: Timestamp.now(),
    });

    expect(counts).toEqual({ contacts: 0, messages: 0 });
    expect((await read('contacts/old'))?.deletedAt).toEqual(earlier);
  });

  it('mensagens agendadas de uma conexão excluída não são mais enviadas', async () => {
    await db.doc('messages/m').set(message('c1'));
    await disableConnectionChildren(db, {
      connectionId: 'c1',
      tenantId: 'u1',
      deletedAt: Timestamp.now(),
    });

    expect(await dispatchDueMessages(db)).toEqual({ dispatched: 0, skipped: 0 });
    expect((await read('messages/m'))?.status).toBe('scheduled');
  });
});
