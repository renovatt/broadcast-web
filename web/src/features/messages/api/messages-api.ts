import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
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
import type { Message, MessageInput } from '../types/message';

const COLLECTION = 'messages';

const messageRef = (messageId: string) => doc(db, COLLECTION, messageId);

/** Texto e destinatários. Os destinatários são uma cópia (snapshot) dos contatos no momento. */
const contentFields = ({ body, recipients }: MessageInput) => ({
  body: body.trim(),
  recipientIds: recipients.map(({ id }) => id),
  recipients: recipients.map(({ id, name, phone }) => ({ id, name, phone })),
});

/**
 * Envio simulado: "agora" grava como enviada com o horário do servidor;
 * "agendar" grava como agendada — a Cloud Function marca como enviada no horário.
 */
const dispatchFields = (input: MessageInput) =>
  input.mode === 'now'
    ? { status: 'sent' as const, sentAt: serverTimestamp(), scheduledAt: null }
    : {
        status: 'scheduled' as const,
        scheduledAt: Timestamp.fromDate(input.scheduledAt),
        sentAt: null,
      };

/**
 * Mensagens ativas de uma conexão, mais recentes primeiro, em tempo real.
 * Uma única inscrição: o filtro Enviadas/Agendadas é feito no cliente (com contadores).
 */
export const subscribeMessages =
  (tenantId: string, connectionId: string): Subscribe<Message[]> =>
  (onNext, onError) =>
    onSnapshot(
      query(
        collection(db, COLLECTION),
        where('tenantId', '==', tenantId),
        where('connectionId', '==', connectionId),
        onlyActive(),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => onNext(snapshot.docs.map((item) => fromSnapshot<Message>(item))),
      onError,
    );

export const createMessage = (tenantId: string, connectionId: string, input: MessageInput) =>
  addDoc(collection(db, COLLECTION), {
    tenantId,
    connectionId,
    ...contentFields(input),
    ...dispatchFields(input),
    ...newDocumentFields(),
  });

/** Só mensagens agendadas podem ser editadas (garantido pelas rules): reagendar ou enviar agora. */
export const updateScheduledMessage = (messageId: string, input: MessageInput) =>
  updateDoc(messageRef(messageId), {
    ...contentFields(input),
    ...dispatchFields(input),
    updatedAt: serverTimestamp(),
  });

/** Soft delete: a mensagem é desativada, não apagada. */
export const deleteMessage = (messageId: string) =>
  updateDoc(messageRef(messageId), softDeleteFields());
