import { useMemo } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { useSubscription } from '@/shared/hooks/use-subscription';
import { subscribeConnections } from '../api/connections-api';

/** Conexões do usuário logado, em tempo real. */
export const useConnections = () => {
  const { uid } = useCurrentUser();
  const subscribe = useMemo(() => subscribeConnections(uid), [uid]);
  return useSubscription(subscribe);
};
