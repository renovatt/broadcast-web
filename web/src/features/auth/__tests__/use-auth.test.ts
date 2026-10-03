import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuth, useCurrentUser } from '../hooks/use-auth';
import { useAuthStore } from '../stores/auth-store';

const initialState = useAuthStore.getState();
const user = { uid: 'u1', email: 'joao@teste.com', displayName: 'João' };

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

describe('useAuth', () => {
  it('expõe usuário e carregamento e reage a mudanças no store', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toEqual({ user: null, loading: true });

    act(() => useAuthStore.getState().setUser(user));
    expect(result.current).toEqual({ user, loading: false });
  });
});

describe('useCurrentUser', () => {
  it('retorna o usuário autenticado', () => {
    useAuthStore.getState().setUser(user);
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toEqual(user);
  });

  it('lança erro fora de uma rota autenticada', () => {
    expect(() => renderHook(() => useCurrentUser())).toThrow(
      'useCurrentUser exige um usuário autenticado.',
    );
  });
});
