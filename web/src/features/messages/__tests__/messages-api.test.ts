import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as firestore from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  createMessage,
  deleteMessage,
  subscribeMessages,
  updateScheduledMessage,
} from '../api/messages-api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn((_db, path: string) => ({ path })),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, path: string, id: string) => ({ path: `${path}/${id}` })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field: string, direction: string) => ({ orderBy: [field, direction] })),
  query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: { fromDate: vi.fn((date: Date) => ({ ts: date.toISOString() })) },
  updateDoc: vi.fn(),
  where: vi.fn((field: string, op: string, value: unknown) => ({ where: [field, op, value] })),
}));

const recipients = [
  { id: 'k1', name: 'Ana', phone: '+5511911110001' },
  { id: 'k2', name: 'Bruno', phone: '+5511911110002' },
];
const when = new Date('2030-10-05T17:30:00.000Z');

beforeEach(() => {
  vi.mocked(firestore.onSnapshot).mockReturnValue(vi.fn());
});

describe('subscribeMessages', () => {
  it('consulta as mensagens ativas do tenant e da conexão, mais recentes primeiro', () => {
    subscribeMessages('u1', 'c1')(vi.fn(), vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith(db, 'messages');
    expect(firestore.query).toHaveBeenCalledWith(
      { path: 'messages' },
      { where: ['tenantId', '==', 'u1'] },
      { where: ['connectionId', '==', 'c1'] },
      { where: ['enabled', '==', true] },
      { orderBy: ['createdAt', 'desc'] },
    );
  });

  it('entrega as mensagens mapeadas e repassa erros', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    subscribeMessages('u1', 'c1')(onNext, onError);
    const [, emit, fail] = vi.mocked(firestore.onSnapshot).mock.calls[0] as unknown as [
      unknown,
      (snapshot: unknown) => void,
      (error: Error) => void,
    ];

    emit({ docs: [{ id: 'm1', data: () => ({ body: 'Oi' }) }] });
    expect(onNext).toHaveBeenCalledWith([{ id: 'm1', body: 'Oi' }]);

    const error = new Error('x');
    fail(error);
    expect(onError).toHaveBeenCalledWith(error);
  });
});

describe('createMessage', () => {
  it('envio imediato: status sent com sentAt do servidor e snapshot dos destinatários', async () => {
    await createMessage('u1', 'c1', { mode: 'now', body: ' Oi ', recipients });

    expect(firestore.addDoc).toHaveBeenCalledWith(
      { path: 'messages' },
      {
        tenantId: 'u1',
        connectionId: 'c1',
        body: 'Oi',
        recipientIds: ['k1', 'k2'],
        recipients,
        status: 'sent',
        sentAt: 'SERVER_TIMESTAMP',
        scheduledAt: null,
        enabled: true,
        deletedAt: null,
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it('agendamento: status scheduled com a data escolhida e sem sentAt', async () => {
    await createMessage('u1', 'c1', {
      mode: 'schedule',
      scheduledAt: when,
      body: 'Oi',
      recipients,
    });

    expect(firestore.addDoc).toHaveBeenCalledWith(
      { path: 'messages' },
      expect.objectContaining({
        status: 'scheduled',
        scheduledAt: { ts: '2030-10-05T17:30:00.000Z' },
        sentAt: null,
      }),
    );
  });

  it('grava só id, nome e telefone de cada destinatário', async () => {
    const withExtra = [{ ...recipients[0], tenantId: 'u1', enabled: true }];
    await createMessage('u1', 'c1', { mode: 'now', body: 'Oi', recipients: withExtra });
    expect(firestore.addDoc).toHaveBeenCalledWith(
      { path: 'messages' },
      expect.objectContaining({ recipients: [recipients[0]] }),
    );
  });
});

describe('updateScheduledMessage', () => {
  it('reagenda alterando conteúdo, destinatários e data', async () => {
    await updateScheduledMessage('m2', {
      mode: 'schedule',
      scheduledAt: when,
      body: 'Novo',
      recipients,
    });
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      { path: 'messages/m2' },
      {
        body: 'Novo',
        recipientIds: ['k1', 'k2'],
        recipients,
        status: 'scheduled',
        scheduledAt: { ts: '2030-10-05T17:30:00.000Z' },
        sentAt: null,
        updatedAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it('"enviar agora" a partir de uma agendada', async () => {
    await updateScheduledMessage('m2', { mode: 'now', body: 'Agora', recipients });
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      { path: 'messages/m2' },
      expect.objectContaining({ status: 'sent', sentAt: 'SERVER_TIMESTAMP', scheduledAt: null }),
    );
  });
});

describe('deleteMessage', () => {
  it('faz soft delete (desativa) em vez de apagar', async () => {
    await deleteMessage('m1');
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      { path: 'messages/m1' },
      { enabled: false, deletedAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP' },
    );
    expect(firestore.deleteDoc).not.toHaveBeenCalled();
  });
});
