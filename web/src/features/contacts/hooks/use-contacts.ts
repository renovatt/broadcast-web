import { useMemo } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { useSubscription } from '@/shared/hooks/use-subscription';
import { subscribeContacts } from '../api/contacts-api';

/** Contatos de uma conexão do usuário logado, em tempo real. */
export const useContacts = (connectionId: string) => {
  const { uid } = useCurrentUser();
  const subscribe = useMemo(() => subscribeContacts(uid, connectionId), [uid, connectionId]);
  return useSubscription(subscribe);
};
