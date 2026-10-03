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
import type { Contact, ContactInput } from '../types/contact';

const COLLECTION = 'contacts';

const contactRef = (contactId: string) => doc(db, COLLECTION, contactId);

/** Contatos de uma conexão, em ordem alfabética, em tempo real. O filtro por tenant é obrigatório (rules). */
export const subscribeContacts =
  (tenantId: string, connectionId: string): Subscribe<Contact[]> =>
  (onNext, onError) =>
    onSnapshot(
      query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        where('connectionId', '==', connectionId),
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateContact = (contactId: string, { name, phone }: ContactInput) =>
  updateDoc(contactRef(contactId), { name: name.trim(), phone, updatedAt: serverTimestamp() });

export const deleteContact = (contactId: string) => deleteDoc(contactRef(contactId));
