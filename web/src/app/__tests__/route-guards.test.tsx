import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { signOut } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { ProtectedRoute, PublicOnlyRoute } from '../route-guards';

vi.mock('@/features/auth/api/auth-api', () => ({ signOut: vi.fn() }));

const initialState = useAuthStore.getState();
const user = { uid: 'u1', email: 'joao@teste.com', displayName: 'João' };

const LocationProbe = ({ label }: { label: string }) => {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return (
    <p>
      {label}
      {from && ` (from ${from})`}
    </p>
  );
};

const renderAt = (route: string, state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LocationProbe label="login" />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/connections" element={<LocationProbe label="connections" />} />
          <Route path="/connections/:id" element={<LocationProbe label="connection detail" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

describe('ProtectedRoute', () => {
  it('mostra o carregamento enquanto a sessão é verificada', () => {
    renderAt('/connections');
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
  });

  it('redireciona para o login lembrando a rota de origem', () => {
    useAuthStore.getState().setUser(null);
    renderAt('/connections/abc');
    expect(screen.getByText('login (from /connections/abc)')).toBeInTheDocument();
  });

  it('renderiza a rota dentro do layout para usuário autenticado', () => {
    useAuthStore.getState().setUser(user);
    renderAt('/connections');
    expect(screen.getByRole('main')).toHaveTextContent('connections');
    expect(screen.getByRole('button', { name: 'Conta' })).toBeInTheDocument();
  });

  it('o menu da conta encerra a sessão', async () => {
    vi.mocked(signOut).mockResolvedValue();
    useAuthStore.getState().setUser(user);
    renderAt('/connections');
    const ui = userEvent.setup();

    await ui.click(screen.getByRole('button', { name: 'Conta' }));
    await ui.click(screen.getByRole('menuitem', { name: 'Sair' }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('avisa quando não consegue sair', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('offline'));
    useAuthStore.getState().setUser(user);
    renderAt('/connections');
    const ui = userEvent.setup();

    await ui.click(screen.getByRole('button', { name: 'Conta' }));
    await ui.click(screen.getByRole('menuitem', { name: 'Sair' }));

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toMatchObject({
        message: 'Não foi possível sair. Tente novamente.',
        severity: 'error',
      }),
    );
  });
});

describe('PublicOnlyRoute', () => {
  it('mostra o login para visitante', () => {
    useAuthStore.getState().setUser(null);
    renderAt('/login');
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('usuário autenticado vai para a home', () => {
    useAuthStore.getState().setUser(user);
    renderAt('/login');
    expect(screen.getByText('connections')).toBeInTheDocument();
  });

  it('usuário autenticado volta para a rota de origem', () => {
    useAuthStore.getState().setUser(user);
    renderAt('/login', { from: '/connections/abc' });
    expect(screen.getByText('connection detail')).toBeInTheDocument();
  });
});
