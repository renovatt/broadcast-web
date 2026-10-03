import { beforeEach, describe, expect, it } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { useNotificationStore } from '../stores/notification-store';
import { withFeedback } from '../utils/with-feedback';

const notification = () => useNotificationStore.getState().notification;

beforeEach(() => {
  useNotificationStore.getState().dismiss();
});

describe('withFeedback', () => {
  it('retorna o resultado da ação e mostra o toast de sucesso', async () => {
    await expect(withFeedback(async () => 42, 'Salvo!')).resolves.toBe(42);
    expect(notification()).toMatchObject({ severity: 'success', message: 'Salvo!' });
  });

  it('mostra o erro traduzido do Firestore e relança o erro', async () => {
    const error = new FirebaseError('permission-denied', 'x');
    await expect(
      withFeedback(async () => {
        throw error;
      }, 'Salvo!'),
    ).rejects.toBe(error);
    expect(notification()).toMatchObject({
      severity: 'error',
      message: 'Você não tem permissão para acessar estes dados.',
    });
  });

  it('aceita uma mensagem de erro personalizada', async () => {
    await expect(
      withFeedback(
        async () => {
          throw new Error('x');
        },
        'Salvo!',
        () => 'Mensagem específica.',
      ),
    ).rejects.toThrow('x');
    expect(notification()).toMatchObject({ severity: 'error', message: 'Mensagem específica.' });
  });
});
