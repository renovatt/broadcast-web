import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { signOut } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ConnectionsPage } from '../pages/connections-page';

vi.mock('@/features/auth/api/auth-api', () => ({ signOut: vi.fn() }));

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'joao@teste.com', displayName: 'João' });
});

describe('ConnectionsPage (provisória)', () => {
  it('cumprimenta o usuário pelo nome', () => {
    renderWithProviders(<ConnectionsPage />);
    expect(screen.getByRole('heading', { name: 'Olá, João' })).toBeInTheDocument();
  });

  it('usa o e-mail quando não há nome', () => {
    useAuthStore.getState().setUser({ uid: 'u1', email: 'joao@teste.com', displayName: null });
    renderWithProviders(<ConnectionsPage />);
    expect(screen.getByRole('heading', { name: 'Olá, joao@teste.com' })).toBeInTheDocument();
  });

  it('encerra a sessão ao clicar em Sair', async () => {
    const { user } = renderWithProviders(<ConnectionsPage />);
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
