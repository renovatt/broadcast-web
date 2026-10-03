import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../stores/auth-store';

const initialState = useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

describe('useAuthStore', () => {
  it('começa sem usuário e carregando', () => {
    expect(useAuthStore.getState()).toMatchObject({ user: null, loading: true });
  });

  it('setUser grava o usuário e encerra o carregamento', () => {
    const user = { uid: 'u1', email: 'joao@teste.com', displayName: 'João' };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState()).toMatchObject({ user, loading: false });
  });

  it('setUser(null) representa sessão encerrada', () => {
    useAuthStore.getState().setUser({ uid: 'u1', email: null, displayName: null });
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState()).toMatchObject({ user: null, loading: false });
  });
});
