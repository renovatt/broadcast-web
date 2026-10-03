import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import type { DocumentSnapshot } from 'firebase/firestore';
import {
  fromSnapshot,
  getFirestoreErrorMessage,
  newDocumentFields,
  onlyActive,
  softDeleteFields,
} from '../utils/firestore';

vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
  where: (field: string, op: string, value: unknown) => ({ where: [field, op, value] }),
}));

describe('fromSnapshot', () => {
  it('junta o id do documento aos dados, estimando timestamps pendentes', () => {
    const data = vi.fn(() => ({ name: 'Vendas', tenantId: 'u1' }));
    const snapshot = { id: 'c1', data } as unknown as DocumentSnapshot;

    expect(fromSnapshot(snapshot)).toEqual({ id: 'c1', name: 'Vendas', tenantId: 'u1' });
    expect(data).toHaveBeenCalledWith({ serverTimestamps: 'estimate' });
  });
});

describe('getFirestoreErrorMessage', () => {
  it.each([
    ['permission-denied', 'Você não tem permissão para acessar estes dados.'],
    ['not-found', 'O registro não existe mais.'],
    ['unavailable', 'Sem conexão com o servidor. Verifique sua internet.'],
    [
      'failed-precondition',
      'O banco de dados ainda está preparando esta consulta (índice em criação). Tente novamente em alguns minutos.',
    ],
  ])('traduz %s', (code, message) => {
    expect(getFirestoreErrorMessage(new FirebaseError(code, 'x'))).toBe(message);
  });

  it('usa mensagem genérica para outros erros', () => {
    const generic = 'Não foi possível concluir. Tente novamente.';
    expect(getFirestoreErrorMessage(new FirebaseError('internal', 'x'))).toBe(generic);
    expect(getFirestoreErrorMessage(new Error('x'))).toBe(generic);
  });
});

describe('soft delete', () => {
  it('newDocumentFields: documento nasce ativo, sem exclusão e com timestamps do servidor', () => {
    expect(newDocumentFields()).toEqual({
      enabled: true,
      deletedAt: null,
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    });
  });

  it('softDeleteFields: desativa e registra quando', () => {
    expect(softDeleteFields()).toEqual({
      enabled: false,
      deletedAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    });
  });

  it('onlyActive: filtra enabled == true', () => {
    expect(onlyActive()).toEqual({ where: ['enabled', '==', true] });
  });
});
