import { beforeEach, describe, expect, it } from 'vitest';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import {
  activeFields,
  clearEmulator,
  emulatorDb,
  minutesFromNow,
} from '../../../test-utils/firestore-emulator';
import { dispatchDueMessages } from '../dispatch-due-messages';

const db = emulatorDb();

const recipient = { id: 'k1', name: 'Ana', phone: '+5511911110001' };

const scheduled = (overrides: DocumentData = {}) => ({
  tenantId: 'u1',
  connectionId: 'c1',
  body: 'Lembrete',
  recipientIds: [recipient.id],
  recipients: [recipient],
  status: 'scheduled',
  scheduledAt: minutesFromNow(-1),
  sentAt: null,
  ...activeFields(),
  ...overrides,
});

const message = async (id: string) => (await db.doc(`messages/${id}`).get()).data();

beforeEach(async () => {
  await clearEmulator();
});

describe('dispatchDueMessages', () => {
  it('marca como enviadas as agendadas cujo horário já chegou', async () => {
    await db.doc('messages/due').set(scheduled({ scheduledAt: minutesFromNow(-5) }));
    await db.doc('messages/exact').set(scheduled({ scheduledAt: Timestamp.now() }));

    const result = await dispatchDueMessages(db);

    expect(result).toEqual({ dispatched: 2, skipped: 0 });
    for (const id of ['due', 'exact']) {
      const data = await message(id);
      expect(data?.status).toBe('sent');
      expect(data?.sentAt).toBeInstanceOf(Timestamp);
      expect(data?.updatedAt).toBeInstanceOf(Timestamp);
    }
  });

  it('não envia agendadas do futuro', async () => {
    await db.doc('messages/future').set(scheduled({ scheduledAt: minutesFromNow(10) }));

    expect(await dispatchDueMessages(db)).toEqual({ dispatched: 0, skipped: 0 });
    expect((await message('future'))?.status).toBe('scheduled');
  });

  it('não envia mensagens excluídas (soft delete)', async () => {
    await db.doc('messages/deleted').set(scheduled({ enabled: false, deletedAt: Timestamp.now() }));

    expect(await dispatchDueMessages(db)).toEqual({ dispatched: 0, skipped: 0 });
    expect((await message('deleted'))?.status).toBe('scheduled');
  });

  it('não altera mensagens já enviadas', async () => {
    const sentAt = minutesFromNow(-30);
    await db.doc('messages/sent').set(scheduled({ status: 'sent', sentAt, scheduledAt: null }));

    await dispatchDueMessages(db);
    expect((await message('sent'))?.sentAt).toEqual(sentAt);
  });

  it('é idempotente: rodar de novo não reprocessa nada', async () => {
    await db.doc('messages/due').set(scheduled());

    expect(await dispatchDueMessages(db)).toEqual({ dispatched: 1, skipped: 0 });
    const firstSentAt = (await message('due'))?.sentAt;

    expect(await dispatchDueMessages(db)).toEqual({ dispatched: 0, skipped: 0 });
    expect((await message('due'))?.sentAt).toEqual(firstSentAt);
  });

  it('não muda conteúdo, destinatários nem tenant — só status, sentAt e updatedAt', async () => {
    const original = scheduled();
    await db.doc('messages/due').set(original);

    await dispatchDueMessages(db);
    const data = await message('due');

    expect(data).toMatchObject({
      tenantId: 'u1',
      connectionId: 'c1',
      body: 'Lembrete',
      recipientIds: ['k1'],
      recipients: [recipient],
      scheduledAt: original.scheduledAt,
      enabled: true,
    });
  });

  it('pagina: processa mais mensagens que o tamanho da página', async () => {
    const batch = db.batch();
    for (let index = 0; index < 7; index += 1) {
      batch.set(
        db.doc(`messages/m${index}`),
        scheduled({ scheduledAt: minutesFromNow(-index - 1) }),
      );
    }
    await batch.commit();

    const result = await dispatchDueMessages(db, Timestamp.now(), 3);

    expect(result).toEqual({ dispatched: 7, skipped: 0 });
    const pending = await db.collection('messages').where('status', '==', 'scheduled').get();
    expect(pending.size).toBe(0);
  });

  it('usa o "agora" recebido como referência', async () => {
    await db.doc('messages/soon').set(scheduled({ scheduledAt: minutesFromNow(10) }));

    expect(await dispatchDueMessages(db, minutesFromNow(5))).toEqual({ dispatched: 0, skipped: 0 });
    expect(await dispatchDueMessages(db, minutesFromNow(15))).toEqual({
      dispatched: 1,
      skipped: 0,
    });
  });
});
