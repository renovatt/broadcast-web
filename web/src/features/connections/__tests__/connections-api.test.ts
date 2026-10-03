import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as firestore from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  createConnection,
  deleteConnection,
  subscribeConnection,
  subscribeConnections,
  updateConnection,
} from '../api/connections-api';

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

const snapshotDoc = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data,
});

beforeEach(() => {
  vi.mocked(firestore.onSnapshot).mockReturnValue(vi.fn());
});

describe('subscribeConnections', () => {
  it('consulta apenas as conexões do tenant, mais recentes primeiro', () => {
    subscribeConnections('u1')(vi.fn(), vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith(db, 'connections');
    expect(firestore.where).toHaveBeenCalledWith('tenantId', '==', 'u1');
    expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('entrega a lista mapeada com id e repassa erros', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    subscribeConnections('u1')(onNext, onError);

    const [, emit, fail] = vi.mocked(firestore.onSnapshot).mock.calls[0] as unknown as [
      unknown,
      (snapshot: unknown) => void,
      (error: Error) => void,
    ];
    emit({ docs: [snapshotDoc('c1', { name: 'Vendas' }), snapshotDoc('c2', { name: 'Suporte' })] });
    expect(onNext).toHaveBeenCalledWith([
      { id: 'c1', name: 'Vendas' },
      { id: 'c2', name: 'Suporte' },
    ]);

    const error = new Error('denied');
    fail(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('retorna a função de cancelamento do onSnapshot', () => {
    const unsubscribe = vi.fn();
    vi.mocked(firestore.onSnapshot).mockReturnValue(unsubscribe);
    expect(subscribeConnections('u1')(vi.fn(), vi.fn())).toBe(unsubscribe);
  });
});

describe('subscribeConnection', () => {
  it('observa o documento e entrega null quando não existe', () => {
    const onNext = vi.fn();
    subscribeConnection('c1')(onNext, vi.fn());

    expect(firestore.doc).toHaveBeenCalledWith(db, 'connections', 'c1');
    const [, emit] = vi.mocked(firestore.onSnapshot).mock.calls[0] as unknown as [
      unknown,
      (snapshot: unknown) => void,
    ];

    emit(snapshotDoc('c1', { name: 'Vendas' }));
    expect(onNext).toHaveBeenLastCalledWith({ id: 'c1', name: 'Vendas' });

    emit({ id: 'c1', exists: () => false, data: () => undefined });
    expect(onNext).toHaveBeenLastCalledWith(null);
  });
});

describe('escritas', () => {
  it('createConnection grava tenant, nome sem espaços e timestamps do servidor', async () => {
    await createConnection('u1', { name: '  Vendas ' });
    expect(firestore.addDoc).toHaveBeenCalledWith(
      { path: 'connections' },
      {
        tenantId: 'u1',
        name: 'Vendas',
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      },
    );
  });

  it('updateConnection altera só o nome e o updatedAt', async () => {
    await updateConnection('c1', { name: ' Suporte ' });
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      { path: 'connections/c1' },
      { name: 'Suporte', updatedAt: 'SERVER_TIMESTAMP' },
    );
  });

  it('deleteConnection remove o documento', async () => {
    await deleteConnection('c1');
    expect(firestore.deleteDoc).toHaveBeenCalledWith({ path: 'connections/c1' });
  });
});
