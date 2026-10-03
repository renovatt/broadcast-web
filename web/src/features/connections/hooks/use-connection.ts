import { useMemo } from 'react';
import { useOutletContext } from 'react-router';
import { useSubscription } from '@/shared/hooks/use-subscription';
import { subscribeConnection } from '../api/connections-api';
import type { Connection } from '../types/connection';

/** Uma conexão em tempo real (`data` = null quando não existe). */
export const useConnection = (connectionId: string) => {
  const subscribe = useMemo(() => subscribeConnection(connectionId), [connectionId]);
  return useSubscription(subscribe);
};

export type ConnectionOutletContext = { connection: Connection };

/** Conexão atual para as páginas filhas do ConnectionLayout (contatos, broadcast). */
export const useCurrentConnection = () => useOutletContext<ConnectionOutletContext>().connection;
