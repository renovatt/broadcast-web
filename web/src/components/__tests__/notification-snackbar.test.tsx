import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notify, useNotificationStore } from '@/shared/stores/notification-store';
import { NotificationSnackbar } from '../notification-snackbar';

beforeEach(() => {
  useNotificationStore.getState().dismiss();
});

describe('NotificationSnackbar', () => {
  it('não mostra nada sem notificação', () => {
    render(<NotificationSnackbar />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra a notificação atual com a severidade correta', () => {
    render(<NotificationSnackbar />);
    act(() => notify.error('Falhou ao salvar'));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Falhou ao salvar');
    expect(alert.className).toMatch(/Error/);
  });

  it('aparece no canto superior direito', () => {
    render(<NotificationSnackbar />);
    act(() => notify.info('Oi'));
    expect(screen.getByRole('alert').closest('.MuiSnackbar-root')).toHaveClass(
      'MuiSnackbar-anchorOriginTopRight',
    );
  });

  it('fecha pelo botão e limpa o store', async () => {
    const user = userEvent.setup();
    render(<NotificationSnackbar />);
    act(() => notify.success('Conexão criada'));

    await user.click(screen.getByRole('button', { name: /close|fechar/i }));

    expect(useNotificationStore.getState().notification).toBeNull();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
