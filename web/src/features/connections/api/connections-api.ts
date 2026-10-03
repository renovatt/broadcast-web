import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Subscribe } from '@/shared/hooks/use-subscription';
import {
  fromSnapshot,
  newDocumentFields,
  onlyActive,
  softDeleteFields,
} from '@/shared/utils/firestore';
import type { Connection, ConnectionInput } from '../types/connection';

const COLLECTION = 'connections';

const connectionRef = (connectionId: string) => doc(db, COLLECTION, connectionId);

/**
 * Conexões ativas do cliente, mais recentes primeiro, em tempo real.
 * O filtro por tenant é obrigatório (rules); o de `enabled` aplica o soft delete.
 */
export const subscribeConnections =
  (tenantId: string): Subscribe<Connection[]> =>
  (onNext, onError) =>
    onSnapshot(
      query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        onlyActive(),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => onNext(snapshot.docs.map((item) => fromSnapshot<Connection>(item))),
      onError,
    );

/**
 * Uma conexão em tempo real; `null` se não existe ou foi excluída (desativada).
 * Conexão de outro cliente é negada pelas rules.
 */
export const subscribeConnection =
  (connectionId: string): Subscribe<Connection | null> =>
  (onNext, onError) =>
    onSnapshot(
      connectionRef(connectionId),
      (snapshot) => {
        const connection = snapshot.exists() ? fromSnapshot<Connection>(snapshot) : null;
        onNext(connection?.enabled ? connection : null);
      },
      onError,
    );

export const createConnection = (tenantId: string, { name }: ConnectionInput) =>
  addDoc(collection(db, COLLECTION), { tenantId, name: name.trim(), ...newDocumentFields() });

export const updateConnection = (connectionId: string, { name }: ConnectionInput) =>
  updateDoc(connectionRef(connectionId), { name: name.trim(), updatedAt: serverTimestamp() });

/**
 * Soft delete: a conexão é desativada, não apagada.
 * Contatos e mensagens dela são desativados no backend (Cloud Function de cascata).
 */
export const deleteConnection = (connectionId: string) =>
  updateDoc(connectionRef(connectionId), softDeleteFields());
