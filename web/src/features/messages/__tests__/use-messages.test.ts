import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { subscribeMessages } from '../api/messages-api';
import { useMessages } from '../hooks/use-messages';
import type { Message } from '../types/message';
import { sentMessage } from './fixtures';

vi.mock('../api/messages-api', () => ({ subscribeMessages: vi.fn() }));

let emit: (data: Message[]) => void = () => undefined;

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  vi.mocked(subscribeMessages).mockImplementation(() => (onNext) => {
    emit = onNext;
    return vi.fn();
  });
});

describe('useMessages', () => {
  it('assina as mensagens do tenant logado para a conexão', () => {
    const { result } = renderHook(() => useMessages('c1'));
    expect(subscribeMessages).toHaveBeenCalledWith('u1', 'c1');

    act(() => emit([sentMessage]));
    expect(result.current).toMatchObject({ data: [sentMessage], loading: false });
  });

  it('reinscreve apenas quando a conexão muda', () => {
    const { rerender } = renderHook(({ id }) => useMessages(id), { initialProps: { id: 'c1' } });
    rerender({ id: 'c1' });
    expect(subscribeMessages).toHaveBeenCalledTimes(1);
    rerender({ id: 'c2' });
    expect(subscribeMessages).toHaveBeenLastCalledWith('u1', 'c2');
  });
});
