import {
  addDoc,
  collection,
  deleteDoc,
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
import { fromSnapshot } from '@/shared/utils/firestore';
import type { Connection, ConnectionInput } from '../types/connection';

const COLLECTION = 'connections';

const connectionRef = (connectionId: string) => doc(db, COLLECTION, connectionId);

/** Conexões do cliente, mais recentes primeiro, em tempo real. O filtro por tenant é obrigatório (rules). */
export const subscribeConnections =
  (tenantId: string): Subscribe<Connection[]> =>
  (onNext, onError) =>
    onSnapshot(
      query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => onNext(snapshot.docs.map((item) => fromSnapshot<Connection>(item))),
      onError,
    );

/** Uma conexão em tempo real; `null` se foi excluída. Conexão de outro cliente é negada pelas rules. */
export const subscribeConnection =
  (connectionId: string): Subscribe<Connection | null> =>
  (onNext, onError) =>
    onSnapshot(
      connectionRef(connectionId),
      (snapshot) => onNext(snapshot.exists() ? fromSnapshot<Connection>(snapshot) : null),
      onError,
    );

export const createConnection = (tenantId: string, { name }: ConnectionInput) =>
  addDoc(collection(db, COLLECTION), {
    tenantId,
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateConnection = (connectionId: string, { name }: ConnectionInput) =>
  updateDoc(connectionRef(connectionId), { name: name.trim(), updatedAt: serverTimestamp() });

/** Contatos e mensagens da conexão são removidos no backend (Cloud Function de cascata). */
export const deleteConnection = (connectionId: string) => deleteDoc(connectionRef(connectionId));
