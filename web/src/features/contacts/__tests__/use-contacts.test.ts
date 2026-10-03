import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { subscribeContacts } from '../api/contacts-api';
import { useContacts } from '../hooks/use-contacts';
import type { Contact } from '../types/contact';

vi.mock('../api/contacts-api', () => ({ subscribeContacts: vi.fn() }));

let emit: (data: Contact[]) => void = () => undefined;

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  vi.mocked(subscribeContacts).mockImplementation(() => (onNext) => {
    emit = onNext;
    return vi.fn();
  });
});

describe('useContacts', () => {
  it('assina os contatos do tenant logado para a conexão informada', () => {
    const { result } = renderHook(() => useContacts('c1'));
    expect(subscribeContacts).toHaveBeenCalledWith('u1', 'c1');

    const contacts = [{ id: 'k1', name: 'Maria' }] as Contact[];
    act(() => emit(contacts));
    expect(result.current).toMatchObject({ data: contacts, loading: false });
  });

  it('reinscreve apenas quando a conexão muda', () => {
    const { rerender } = renderHook(({ id }) => useContacts(id), { initialProps: { id: 'c1' } });
    rerender({ id: 'c1' });
    expect(subscribeContacts).toHaveBeenCalledTimes(1);

    rerender({ id: 'c2' });
    expect(subscribeContacts).toHaveBeenLastCalledWith('u1', 'c2');
    expect(subscribeContacts).toHaveBeenCalledTimes(2);
  });
});
