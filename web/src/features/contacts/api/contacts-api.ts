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
import type { Contact, ContactInput } from '../types/contact';

const COLLECTION = 'contacts';

const contactRef = (contactId: string) => doc(db, COLLECTION, contactId);

/**
 * Contatos ativos de uma conexão, em ordem alfabética, em tempo real.
 * O filtro por tenant é obrigatório (rules); o de `enabled` aplica o soft delete.
 */
export const subscribeContacts =
  (tenantId: string, connectionId: string): Subscribe<Contact[]> =>
  (onNext, onError) =>
    onSnapshot(
      query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        where('connectionId', '==', connectionId),
        onlyActive(),
        orderBy('name', 'asc'),
      ),
      (snapshot) => onNext(snapshot.docs.map((item) => fromSnapshot<Contact>(item))),
      onError,
    );

/** `phone` já deve estar em E.164 (o schema do formulário normaliza). */
export const createContact = (
  tenantId: string,
  connectionId: string,
  { name, phone }: ContactInput,
) =>
  addDoc(collection(db, COLLECTION), {
    tenantId,
    connectionId,
    name: name.trim(),
    phone,
    ...newDocumentFields(),
  });

export const updateContact = (contactId: string, { name, phone }: ContactInput) =>
  updateDoc(contactRef(contactId), { name: name.trim(), phone, updatedAt: serverTimestamp() });

/** Soft delete: o contato é desativado, não apagado. */
export const deleteContact = (contactId: string) =>
  updateDoc(contactRef(contactId), softDeleteFields());
