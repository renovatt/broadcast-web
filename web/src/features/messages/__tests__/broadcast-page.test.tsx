import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { Connection } from '@/features/connections/types/connection';
import { useContacts } from '@/features/contacts/hooks/use-contacts';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { deleteMessage } from '../api/messages-api';
import { useMessages } from '../hooks/use-messages';
import { BroadcastPage } from '../pages/broadcast-page';
import type { Message } from '../types/message';
import { contacts, scheduledMessage, sentMessage } from './fixtures';

vi.mock('@/features/connections/hooks/use-connection', () => ({
  useCurrentConnection: () => ({ id: 'c1', name: 'Vendas' }) as Connection,
}));
vi.mock('@/features/contacts/hooks/use-contacts', () => ({ useContacts: vi.fn() }));
vi.mock('../hooks/use-messages', () => ({ useMessages: vi.fn() }));
vi.mock('../api/messages-api', () => ({
  createMessage: vi.fn(),
  updateScheduledMessage: vi.fn(),
  deleteMessage: vi.fn(),
}));

const state = <T,>(data: T) => ({ data, loading: false, error: undefined });

const mockMessages = (messages: Message[]) =>
  vi.mocked(useMessages).mockReturnValue(state(messages));

beforeEach(() => {
  vi.unstubAllEnvs();
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
  vi.mocked(useContacts).mockReturnValue(state(contacts));
  mockMessages([sentMessage, scheduledMessage]);
});

describe('BroadcastPage', () => {
  it('usa contatos e mensagens da conexão atual e mostra compositor + histórico', () => {
    renderWithProviders(<BroadcastPage />);
    expect(useContacts).toHaveBeenCalledWith('c1');
    expect(useMessages).toHaveBeenCalledWith('c1');
    expect(screen.getByRole('region', { name: 'Nova mensagem' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('mostra carregamento do compositor enquanto os contatos chegam', () => {
    vi.mocked(useContacts).mockReturnValue({ data: undefined, loading: true, error: undefined });
    renderWithProviders(<BroadcastPage />);
    expect(screen.getByLabelText('Carregando contatos')).toBeInTheDocument();
  });

  it('filtra pelo status', async () => {
    const { user } = renderWithProviders(<BroadcastPage />);
    await user.click(screen.getByRole('button', { name: 'Agendadas (1)' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('article')).toHaveTextContent('Agendada');
  });

  it('abre a edição da mensagem agendada', async () => {
    const { user } = renderWithProviders(<BroadcastPage />);
    await user.click(screen.getByRole('button', { name: 'Editar mensagem' }));
    expect(screen.getByRole('dialog', { name: 'Editar mensagem agendada' })).toBeInTheDocument();
  });

  it('fecha a edição e avisa se a mensagem for enviada enquanto o diálogo está aberto', async () => {
    const { user, rerender } = renderWithProviders(<BroadcastPage />);
    await user.click(screen.getByRole('button', { name: 'Editar mensagem' }));

    // Tempo real: a Cloud Function marcou a mensagem como enviada.
    mockMessages([sentMessage, { ...scheduledMessage, status: 'sent' }]);
    act(() => rerender(<BroadcastPage />));

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Editar mensagem agendada' }),
      ).not.toBeInTheDocument(),
    );
    expect(useNotificationStore.getState().notification?.message).toBe(
      'A mensagem foi enviada ou excluída enquanto você editava.',
    );
  });

  it('exclui agendada com aviso de cancelamento do agendamento', async () => {
    vi.mocked(deleteMessage).mockResolvedValue();
    const { user } = renderWithProviders(<BroadcastPage />);

    const scheduled = screen
      .getAllByRole('article')
      .find((item) => item.textContent?.includes('Agendada'))!;
    await user.click(within(scheduled).getByRole('button', { name: 'Excluir mensagem' }));
    const dialog = screen.getByRole('dialog', { name: 'Excluir mensagem?' });
    expect(dialog).toHaveTextContent('O agendamento será cancelado e a mensagem não será enviada.');

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(deleteMessage).toHaveBeenCalledWith('m2');
    await waitFor(() =>
      expect(useNotificationStore.getState().notification?.message).toBe('Mensagem excluída.'),
    );
  });

  it('exclusão de enviada explica que sai do histórico', async () => {
    const { user } = renderWithProviders(<BroadcastPage />);
    const sent = screen
      .getAllByRole('article')
      .find((item) => item.textContent?.includes('Enviada'))!;
    await user.click(within(sent).getByRole('button', { name: 'Excluir mensagem' }));
    expect(screen.getByRole('dialog', { name: 'Excluir mensagem?' })).toHaveTextContent(
      'A mensagem sairá do histórico desta conexão.',
    );
  });

  it('sem aviso de plano gratuito quando as Cloud Functions estão publicadas', () => {
    renderWithProviders(<BroadcastPage />);
    expect(screen.queryByText(/plano gratuito/)).not.toBeInTheDocument();
  });

  it('avisa que o agendamento não é processado sem as Cloud Functions', () => {
    vi.stubEnv('VITE_FUNCTIONS_ENABLED', 'false');
    renderWithProviders(<BroadcastPage />);
    expect(screen.getByText(/plano gratuito/)).toHaveTextContent(
      'mensagens agendadas permanecem como Agendadas',
    );
  });
});
