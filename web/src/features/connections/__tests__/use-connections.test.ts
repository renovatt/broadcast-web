import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { subscribeConnections } from '../api/connections-api';
import { useConnections } from '../hooks/use-connections';
import type { Connection } from '../types/connection';

vi.mock('../api/connections-api', () => ({ subscribeConnections: vi.fn() }));

let emit: (data: Connection[]) => void = () => undefined;

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  vi.mocked(subscribeConnections).mockImplementation(() => (onNext) => {
    emit = onNext;
    return vi.fn();
  });
});

describe('useConnections', () => {
  it('assina as conexões do usuário logado e expõe os dados em tempo real', () => {
    const { result } = renderHook(() => useConnections());

    expect(subscribeConnections).toHaveBeenCalledWith('u1');
    expect(result.current.loading).toBe(true);

    const connections = [{ id: 'c1', name: 'Vendas' }] as Connection[];
    act(() => emit(connections));
    expect(result.current).toMatchObject({ data: connections, loading: false });
  });

  it('não reabre a inscrição a cada render', () => {
    const { rerender } = renderHook(() => useConnections());
    rerender();
    rerender();
    expect(subscribeConnections).toHaveBeenCalledTimes(1);
  });
});
