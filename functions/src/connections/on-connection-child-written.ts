import { logger } from 'firebase-functions';
import { onDocumentWritten, type FirestoreEvent } from 'firebase-functions/firestore';
import type { Change, DocumentSnapshot } from 'firebase-functions/firestore';
import { db } from '../lib/firestore';
import { affectsStats, connectionIdOf } from './affects-stats';
import { refreshConnectionStats } from './refresh-connection-stats';

type ChildEvent = FirestoreEvent<Change<DocumentSnapshot> | undefined>;

const handleChildWritten = async (event: ChildEvent) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!affectsStats(before, after)) return;

  const connectionId = connectionIdOf(before, after);
  if (!connectionId) return;

  const stats = await refreshConnectionStats(db, connectionId);
  logger.debug('Resumo da conexão atualizado', { connectionId, stats });
};

/** Mantém `connections/{id}.stats` em dia quando contatos mudam. */
export const onContactWritten = onDocumentWritten('contacts/{contactId}', handleChildWritten);

/** Mantém `connections/{id}.stats` em dia quando mensagens mudam (inclusive agendada → enviada). */
export const onMessageWritten = onDocumentWritten('messages/{messageId}', handleChildWritten);
