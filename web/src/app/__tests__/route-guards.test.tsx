import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ProtectedRoute, PublicOnlyRoute } from '../route-guards';

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

  it('renderiza a rota para usuário autenticado', () => {
    useAuthStore.getState().setUser(user);
    renderAt('/connections');
    expect(screen.getByText('connections')).toBeInTheDocument();
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
