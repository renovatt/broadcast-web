import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import type { DocumentSnapshot } from 'firebase/firestore';
import { fromSnapshot, getFirestoreErrorMessage } from '../utils/firestore';

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
