import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as firestore from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  createContact,
  deleteContact,
  subscribeContacts,
  updateContact,
} from '../api/contacts-api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn((_db, path: string) => ({ path })),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, path: string, id: string) => ({ path: `${path}/${id}` })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field: string, direction: string) => ({ orderBy: [field, direction] })),
  query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: vi.fn(),
  where: vi.fn((field: string, op: string, value: unknown) => ({ where: [field, op, value] })),
}));

beforeEach(() => {
  vi.mocked(firestore.onSnapshot).mockReturnValue(vi.fn());
});

describe('subscribeContacts', () => {
  it('consulta os contatos do tenant e da conexão, em ordem alfabética', () => {
    subscribeContacts('u1', 'c1')(vi.fn(), vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith(db, 'contacts');
    expect(firestore.query).toHaveBeenCalledWith(
      { path: 'contacts' },
      { where: ['tenantId', '==', 'u1'] },
      { where: ['connectionId', '==', 'c1'] },
      { orderBy: ['name', 'asc'] },
    );
  });

  it('entrega os contatos mapeados com id e repassa erros', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    subscribeContacts('u1', 'c1')(onNext, onError);

    const [, emit, fail] = vi.mocked(firestore.onSnapshot).mock.calls[0] as unknown as [
      unknown,
      (snapshot: unknown) => void,
      (error: Error) => void,
    ];
    emit({ docs: [{ id: 'k1', data: () => ({ name: 'Maria', phone: '+5511999998888' }) }] });
    expect(onNext).toHaveBeenCalledWith([{ id: 'k1', name: 'Maria', phone: '+5511999998888' }]);

    const error = new Error('denied');
    fail(error);
    expect(onError).toHaveBeenCalledWith(error);
  });
});

describe('escritas', () => {
  it('createContact grava tenant, conexão e timestamps do servidor', async () => {
    await createContact('u1', 'c1', { name: ' Maria ', phone: '+5511999998888' });
    expect(firestore.addDoc).toHaveBeenCalledWith(
      { path: 'contacts' },
      {
        tenantId: 'u1',
        connectionId: 'c1',
        name: 'Maria',
        phone: '+5511999998888',
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it('updateContact altera apenas nome, telefone e updatedAt', async () => {
    await updateContact('k1', { name: 'Maria S.', phone: '+5511911112222' });
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      { path: 'contacts/k1' },
      { name: 'Maria S.', phone: '+5511911112222', updatedAt: 'SERVER_TIMESTAMP' },
    );
  });

  it('deleteContact remove o documento', async () => {
    await deleteContact('k1');
    expect(firestore.deleteDoc).toHaveBeenCalledWith({ path: 'contacts/k1' });
  });
});
