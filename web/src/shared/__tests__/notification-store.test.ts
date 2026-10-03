import { beforeEach, describe, expect, it } from 'vitest';
import { notify, useNotificationStore } from '../stores/notification-store';

beforeEach(() => {
  useNotificationStore.getState().dismiss();
});

describe('useNotificationStore', () => {
  it('começa sem notificação', () => {
    expect(useNotificationStore.getState().notification).toBeNull();
  });

  it('notify usa "success" como padrão', () => {
    useNotificationStore.getState().notify('Salvo!');
    expect(useNotificationStore.getState().notification).toMatchObject({
      message: 'Salvo!',
      severity: 'success',
    });
  });

  it('a notificação mais recente substitui a anterior, com id novo', () => {
    useNotificationStore.getState().notify('Primeira');
    const firstId = useNotificationStore.getState().notification?.id;
    useNotificationStore.getState().notify('Segunda', 'error');

    const current = useNotificationStore.getState().notification;
    expect(current).toMatchObject({ message: 'Segunda', severity: 'error' });
    expect(current?.id).not.toBe(firstId);
  });

  it('dismiss remove a notificação', () => {
    useNotificationStore.getState().notify('Algo');
    useNotificationStore.getState().dismiss();
    expect(useNotificationStore.getState().notification).toBeNull();
  });
});

describe('notify (atalhos)', () => {
  it.each([
    ['success', notify.success],
    ['error', notify.error],
    ['info', notify.info],
  ] as const)('notify.%s define a severidade', (severity, fn) => {
    fn('Mensagem');
    expect(useNotificationStore.getState().notification).toMatchObject({
      message: 'Mensagem',
      severity,
    });
  });
});
