import { useEffect, useState } from 'react';

/** Função de inscrição em tempo real (ex.: um onSnapshot). Retorna a função de cancelamento. */
export type Subscribe<T> = (
  onNext: (data: T) => void,
  onError: (error: Error) => void,
) => () => void;

type SubscriptionState<T> = {
  source: Subscribe<T> | null;
  data?: T;
  error?: Error;
};

/**
 * Mantém um valor sincronizado com uma fonte em tempo real.
 * `subscribe` deve ser estável (useCallback/useMemo): trocar a referência reinicia a inscrição.
 * Passar `null` deixa o hook inativo (ex.: enquanto falta um parâmetro).
 */
export const useSubscription = <T>(subscribe: Subscribe<T> | null) => {
  const [state, setState] = useState<SubscriptionState<T>>({ source: null });

  useEffect(() => {
    if (!subscribe) return undefined;
    return subscribe(
      (data) => setState({ source: subscribe, data }),
      (error) => setState({ source: subscribe, error }),
    );
  }, [subscribe]);

  // Resultados de uma inscrição anterior são descartados até a nova responder.
  const isCurrent = state.source === subscribe;

  return {
    data: isCurrent ? state.data : undefined,
    error: isCurrent ? state.error : undefined,
    loading: subscribe !== null && !isCurrent,
  };
};
