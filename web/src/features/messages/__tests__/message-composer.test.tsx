import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { DocumentReference } from 'firebase/firestore';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { createMessage } from '../api/messages-api';
import { MessageComposer } from '../_components/message-composer';
import { contacts } from './fixtures';

vi.mock('../api/messages-api', () => ({ createMessage: vi.fn() }));

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
});

const sendToAna = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
  await user.type(screen.getByLabelText('Mensagem'), 'Oi');
  await user.click(screen.getByRole('button', { name: 'Enviar agora' }));
};

describe('MessageComposer', () => {
  it('sem contatos, orienta a cadastrar na aba Contatos', () => {
    renderWithProviders(<MessageComposer connectionId="c1" contacts={[]} />);
    expect(screen.getByRole('link', { name: 'Adicionar contatos' })).toHaveAttribute(
      'href',
      '/connections/c1/contacts',
    );
    expect(screen.queryByLabelText('Mensagem')).not.toBeInTheDocument();
  });

  it('envia para o tenant e a conexão, notifica e limpa o formulário', async () => {
    vi.mocked(createMessage).mockResolvedValue({} as DocumentReference);
    const { user } = renderWithProviders(<MessageComposer connectionId="c1" contacts={contacts} />);

    await sendToAna(user);

    expect(createMessage).toHaveBeenCalledWith('u1', 'c1', {
      mode: 'now',
      body: 'Oi',
      recipients: [{ id: 'k1', name: 'Ana', phone: '+5511911110001' }],
    });
    await waitFor(() =>
      expect(useNotificationStore.getState().notification?.message).toBe('Mensagem enviada.'),
    );
    await waitFor(() => expect(screen.getByLabelText('Mensagem')).toHaveValue(''));
  });

  it('o botão muda para "Agendar envio" no modo agendado', async () => {
    const { user } = renderWithProviders(<MessageComposer connectionId="c1" contacts={contacts} />);
    await user.click(screen.getByRole('radio', { name: 'Agendar' }));
    expect(screen.getByRole('button', { name: 'Agendar envio' })).toBeInTheDocument();
  });

  it('notifica o erro e mantém o texto digitado', async () => {
    vi.mocked(createMessage).mockRejectedValue(new FirebaseError('permission-denied', 'x'));
    const { user } = renderWithProviders(<MessageComposer connectionId="c1" contacts={contacts} />);

    await sendToAna(user);

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toMatchObject({
        severity: 'error',
        message: 'Você não tem permissão para acessar estes dados.',
      }),
    );
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Oi');
  });
});
