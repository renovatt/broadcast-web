import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { renderWithProviders } from '@test-utils/render';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { updateScheduledMessage } from '../api/messages-api';
import { EditMessageDialog } from '../_components/edit-message-dialog';
import { contacts, scheduledMessage } from './fixtures';

vi.mock('../api/messages-api', () => ({ updateScheduledMessage: vi.fn() }));

beforeEach(() => {
  useNotificationStore.getState().dismiss();
});

const renderDialog = (props: Partial<Parameters<typeof EditMessageDialog>[0]> = {}) => {
  const onClose = vi.fn();
  const result = renderWithProviders(
    <EditMessageDialog
      message={scheduledMessage}
      contacts={contacts}
      onClose={onClose}
      {...props}
    />,
  );
  return { ...result, onClose };
};

describe('EditMessageDialog', () => {
  it('preenche com destinatários, texto e modo agendado', () => {
    renderDialog();
    expect(screen.getByRole('dialog', { name: 'Editar mensagem agendada' })).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Lembrete da reunião');
    expect(screen.getByText('3 selecionados')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Agendar' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar agendamento' })).toBeInTheDocument();
  });

  it('avisa quando destinatários foram excluídos dos contatos', () => {
    renderDialog({ contacts: contacts.slice(0, 1) });
    expect(
      screen.getByText(
        '2 destinatários foram excluídos dos contatos e não receberão esta mensagem.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('1 selecionado')).toBeInTheDocument();
  });

  it('salva o reagendamento, notifica e fecha', async () => {
    vi.mocked(updateScheduledMessage).mockResolvedValue();
    const { user, onClose } = renderDialog();

    await user.clear(screen.getByLabelText('Mensagem'));
    await user.type(screen.getByLabelText('Mensagem'), 'Novo texto');
    await user.click(screen.getByRole('button', { name: 'Salvar agendamento' }));

    await waitFor(() =>
      expect(updateScheduledMessage).toHaveBeenCalledWith(
        'm2',
        expect.objectContaining({
          mode: 'schedule',
          body: 'Novo texto',
          scheduledAt: new Date(2030, 9, 5, 14, 30),
        }),
      ),
    );
    expect(useNotificationStore.getState().notification?.message).toBe(
      'Agendamento atualizado para 05/10/2030 14:30.',
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('pode "enviar agora" uma mensagem agendada', async () => {
    vi.mocked(updateScheduledMessage).mockResolvedValue();
    const { user } = renderDialog();

    await user.click(screen.getByRole('radio', { name: 'Enviar agora' }));
    await user.click(screen.getByRole('button', { name: 'Enviar agora' }));

    await waitFor(() =>
      expect(updateScheduledMessage).toHaveBeenCalledWith(
        'm2',
        expect.objectContaining({ mode: 'now' }),
      ),
    );
    expect(useNotificationStore.getState().notification?.message).toBe('Mensagem enviada.');
  });

  it('explica a falha quando a mensagem já foi enviada (rules negam)', async () => {
    vi.mocked(updateScheduledMessage).mockRejectedValue(
      new FirebaseError('permission-denied', 'x'),
    );
    const { user, onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Salvar agendamento' }));

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toMatchObject({
        severity: 'error',
        message: 'Não foi possível salvar: a mensagem pode já ter sido enviada.',
      }),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cancelar fecha sem salvar', async () => {
    const { user, onClose } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
    expect(updateScheduledMessage).not.toHaveBeenCalled();
  });
});
