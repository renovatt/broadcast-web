import { useMemo } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { useSubscription } from '@/shared/hooks/use-subscription';
import { subscribeMessages } from '../api/messages-api';

/** Mensagens ativas de uma conexão do usuário logado, em tempo real. */
export const useMessages = (connectionId: string) => {
  const { uid } = useCurrentUser();
  const subscribe = useMemo(() => subscribeMessages(uid, connectionId), [uid, connectionId]);
  return useSubscription(subscribe);
};
