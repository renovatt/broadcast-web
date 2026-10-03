import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { DocumentReference } from 'firebase/firestore';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { createConnection, updateConnection } from '../api/connections-api';
import { ConnectionFormDialog } from '../_components/connection-form-dialog';
import type { Connection } from '../types/connection';

vi.mock('../api/connections-api', () => ({
  createConnection: vi.fn(),
  updateConnection: vi.fn(),
}));

const existing = { id: 'c1', name: 'Vendas' } as Connection;

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
});

describe('ConnectionFormDialog — criação', () => {
  it('valida o nome antes de salvar', async () => {
    const { user } = renderWithProviders(<ConnectionFormDialog onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Informe o nome da conexão.')).toBeInTheDocument();
    expect(createConnection).not.toHaveBeenCalled();
  });

  it('cria para o tenant logado, notifica e fecha', async () => {
    vi.mocked(createConnection).mockResolvedValue({} as DocumentReference);
    const onClose = vi.fn();
    const { user } = renderWithProviders(<ConnectionFormDialog onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'Nova conexão' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nome da conexão'), 'Suporte');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(createConnection).toHaveBeenCalledWith('u1', { name: 'Suporte' });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(useNotificationStore.getState().notification?.message).toBe('Conexão criada.');
  });

  it('mantém aberto e notifica o erro quando falha', async () => {
    vi.mocked(createConnection).mockRejectedValue(new FirebaseError('permission-denied', 'x'));
    const onClose = vi.fn();
    const { user } = renderWithProviders(<ConnectionFormDialog onClose={onClose} />);

    await user.type(screen.getByLabelText('Nome da conexão'), 'Suporte');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toMatchObject({
        severity: 'error',
        message: 'Você não tem permissão para acessar estes dados.',
      }),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ConnectionFormDialog — edição', () => {
  it('preenche o nome atual e salva a alteração', async () => {
    vi.mocked(updateConnection).mockResolvedValue();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <ConnectionFormDialog connection={existing} onClose={onClose} />,
    );

    expect(screen.getByRole('dialog', { name: 'Editar conexão' })).toBeInTheDocument();
    const input = screen.getByLabelText('Nome da conexão');
    expect(input).toHaveValue('Vendas');

    await user.clear(input);
    await user.type(input, 'Vendas SP');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateConnection).toHaveBeenCalledWith('c1', { name: 'Vendas SP' });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useNotificationStore.getState().notification?.message).toBe('Conexão atualizada.');
  });

  it('cancelar fecha sem salvar', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <ConnectionFormDialog connection={existing} onClose={onClose} />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
    expect(updateConnection).not.toHaveBeenCalled();
  });
});
