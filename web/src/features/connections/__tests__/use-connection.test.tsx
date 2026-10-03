import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { subscribeConnection } from '../api/connections-api';
import { useConnection, useCurrentConnection } from '../hooks/use-connection';
import type { Connection } from '../types/connection';

vi.mock('../api/connections-api', () => ({ subscribeConnection: vi.fn() }));

let emit: (data: Connection | null) => void = () => undefined;

beforeEach(() => {
  vi.mocked(subscribeConnection).mockImplementation(() => (onNext) => {
    emit = onNext;
    return vi.fn();
  });
});

describe('useConnection', () => {
  it('assina a conexão pelo id e reinscreve quando o id muda', () => {
    const { result, rerender } = renderHook(({ id }) => useConnection(id), {
      initialProps: { id: 'c1' },
    });
    expect(subscribeConnection).toHaveBeenLastCalledWith('c1');

    act(() => emit({ id: 'c1', name: 'Vendas' } as Connection));
    expect(result.current.data).toMatchObject({ id: 'c1', name: 'Vendas' });

    rerender({ id: 'c2' });
    expect(subscribeConnection).toHaveBeenLastCalledWith('c2');
    expect(result.current.loading).toBe(true);
  });

  it('expõe null quando a conexão não existe', () => {
    const { result } = renderHook(() => useConnection('x'));
    act(() => emit(null));
    expect(result.current).toMatchObject({ data: null, loading: false });
  });
});

describe('useCurrentConnection', () => {
  it('lê a conexão do contexto do Outlet', () => {
    const Child = () => <p>{useCurrentConnection().name}</p>;
    const connection = { id: 'c1', name: 'Suporte' } as Connection;

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={{ connection }} />}>
            <Route index element={<Child />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Suporte')).toBeInTheDocument();
  });
});
