import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '../api/auth-api';
import { useAuthListener } from '../hooks/use-auth-listener';
import { useAuthStore } from '../stores/auth-store';

vi.mock('../api/auth-api', () => ({ subscribeToAuthChanges: vi.fn() }));

const initialState = useAuthStore.getState();
const unsubscribe = vi.fn();
let emit: (user: User | null) => void = () => undefined;

beforeEach(() => {
  useAuthStore.setState(initialState, true);
  vi.mocked(subscribeToAuthChanges).mockImplementation((callback) => {
    emit = callback;
    return unsubscribe;
  });
});

describe('useAuthListener', () => {
  it('sincroniza o store com login e logout do Firebase', () => {
    renderHook(() => useAuthListener());
    expect(subscribeToAuthChanges).toHaveBeenCalledTimes(1);

    act(() => emit({ uid: 'u1', email: 'joao@teste.com', displayName: 'João' } as User));
    expect(useAuthStore.getState()).toMatchObject({
      user: { uid: 'u1', email: 'joao@teste.com', displayName: 'João' },
      loading: false,
    });

    act(() => emit(null));
    expect(useAuthStore.getState()).toMatchObject({ user: null, loading: false });
  });

  it('cancela a inscrição ao desmontar', () => {
    const { unmount } = renderHook(() => useAuthListener());
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
