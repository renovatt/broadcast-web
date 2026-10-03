import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { deleteConnection } from '../api/connections-api';
import { useConnections } from '../hooks/use-connections';
import { ConnectionsPage } from '../pages/connections-page';
import type { Connection } from '../types/connection';

vi.mock('../hooks/use-connections', () => ({ useConnections: vi.fn() }));
vi.mock('../api/connections-api', () => ({
  createConnection: vi.fn(),
  updateConnection: vi.fn(),
  deleteConnection: vi.fn(),
}));

const timestamp = { toDate: () => new Date(2026, 9, 1) };
const connections = [
  { id: 'c1', name: 'Vendas', createdAt: timestamp },
  { id: 'c2', name: 'Suporte', createdAt: timestamp },
] as unknown as Connection[];

const mockState = (state: Partial<ReturnType<typeof useConnections>>) =>
  vi.mocked(useConnections).mockReturnValue({
    data: undefined,
    error: undefined,
    loading: false,
    ...state,
  });

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
});

describe('ConnectionsPage', () => {
  it('mostra o carregamento', () => {
    mockState({ loading: true });
    renderWithProviders(<ConnectionsPage />);
    expect(screen.getByLabelText('Carregando conexões')).toBeInTheDocument();
  });

  it('mostra o erro da consulta', () => {
    mockState({ error: new FirebaseError('permission-denied', 'x') });
    renderWithProviders(<ConnectionsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Você não tem permissão para acessar estes dados.',
    );
  });

  it('mostra o estado vazio com atalho para criar', async () => {
    mockState({ data: [] });
    const { user } = renderWithProviders(<ConnectionsPage />);

    expect(screen.getByRole('heading', { name: 'Nenhuma conexão ainda' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Criar conexão' }));
    expect(screen.getByRole('dialog', { name: 'Nova conexão' })).toBeInTheDocument();
  });

  it('lista as conexões', () => {
    mockState({ data: connections });
    renderWithProviders(<ConnectionsPage />);

    const list = screen.getByRole('list', { name: 'Conexões' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByRole('heading', { name: 'Vendas' })).toBeInTheDocument();
  });

  it('abre a criação pelo botão do cabeçalho', async () => {
    mockState({ data: connections });
    const { user } = renderWithProviders(<ConnectionsPage />);
    await user.click(screen.getByRole('button', { name: 'Nova conexão' }));
    expect(screen.getByRole('dialog', { name: 'Nova conexão' })).toBeInTheDocument();
  });

  it('abre a edição com o nome da conexão', async () => {
    mockState({ data: connections });
    const { user } = renderWithProviders(<ConnectionsPage />);
    await user.click(screen.getByRole('button', { name: 'Editar Suporte' }));

    expect(screen.getByRole('dialog', { name: 'Editar conexão' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da conexão')).toHaveValue('Suporte');
  });

  it('exclui após confirmação e notifica', async () => {
    mockState({ data: connections });
    vi.mocked(deleteConnection).mockResolvedValue();
    const { user } = renderWithProviders(<ConnectionsPage />);

    await user.click(screen.getByRole('button', { name: 'Excluir Vendas' }));
    const dialog = screen.getByRole('dialog', { name: 'Excluir "Vendas"?' });
    expect(dialog).toHaveTextContent(
      'Os contatos e as mensagens desta conexão também serão excluídos',
    );

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(deleteConnection).toHaveBeenCalledWith('c1');
    await waitFor(() =>
      expect(useNotificationStore.getState().notification?.message).toBe('Conexão excluída.'),
    );
  });

  it('notifica erro ao excluir e mantém o diálogo aberto', async () => {
    mockState({ data: connections });
    vi.mocked(deleteConnection).mockRejectedValue(new FirebaseError('unavailable', 'x'));
    const { user } = renderWithProviders(<ConnectionsPage />);

    await user.click(screen.getByRole('button', { name: 'Excluir Vendas' }));
    const dialog = screen.getByRole('dialog', { name: 'Excluir "Vendas"?' });
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toMatchObject({
        severity: 'error',
        message: 'Sem conexão com o servidor. Verifique sua internet.',
      }),
    );
    expect(screen.getByRole('dialog', { name: 'Excluir "Vendas"?' })).toBeInTheDocument();
  });
});
