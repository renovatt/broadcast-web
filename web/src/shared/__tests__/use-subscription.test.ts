import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSubscription, type Subscribe } from '../hooks/use-subscription';

/** Fonte controlável: permite emitir dados/erros e verificar o cancelamento. */
const createSource = <T>() => {
  const unsubscribe = vi.fn();
  let next: (data: T) => void = () => undefined;
  let fail: (error: Error) => void = () => undefined;
  const subscribe: Subscribe<T> = vi.fn((onNext, onError) => {
    next = onNext;
    fail = onError;
    return unsubscribe;
  });
  return { subscribe, unsubscribe, emit: (data: T) => next(data), fail: (e: Error) => fail(e) };
};

describe('useSubscription', () => {
  it('fica carregando até a primeira emissão e então expõe os dados', () => {
    const source = createSource<string[]>();
    const { result } = renderHook(() => useSubscription(source.subscribe));

    expect(result.current).toEqual({ data: undefined, error: undefined, loading: true });

    act(() => source.emit(['a', 'b']));
    expect(result.current).toEqual({ data: ['a', 'b'], error: undefined, loading: false });
  });

  it('atualiza a cada nova emissão (tempo real)', () => {
    const source = createSource<number>();
    const { result } = renderHook(() => useSubscription(source.subscribe));

    act(() => source.emit(1));
    act(() => source.emit(2));
    expect(result.current.data).toBe(2);
  });

  it('expõe o erro da fonte', () => {
    const source = createSource<number>();
    const { result } = renderHook(() => useSubscription(source.subscribe));
    const error = new Error('permission-denied');

    act(() => source.fail(error));
    expect(result.current).toEqual({ data: undefined, error, loading: false });
  });

  it('cancela a inscrição ao desmontar', () => {
    const source = createSource<number>();
    const { unmount } = renderHook(() => useSubscription(source.subscribe));
    unmount();
    expect(source.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('ao trocar de fonte, cancela a anterior e descarta seus dados', () => {
    const first = createSource<string>();
    const second = createSource<string>();
    const { result, rerender } = renderHook(({ subscribe }) => useSubscription(subscribe), {
      initialProps: { subscribe: first.subscribe },
    });

    act(() => first.emit('primeira'));
    rerender({ subscribe: second.subscribe });

    expect(first.unsubscribe).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ data: undefined, error: undefined, loading: true });

    act(() => second.emit('segunda'));
    expect(result.current.data).toBe('segunda');
  });

  it('fica inativo com null', () => {
    const { result } = renderHook(() => useSubscription<number>(null));
    expect(result.current).toEqual({ data: undefined, error: undefined, loading: false });
  });
});
