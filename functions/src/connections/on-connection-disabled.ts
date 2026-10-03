import { Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentUpdated } from 'firebase-functions/firestore';
import { db } from '../lib/firestore';
import { disableConnectionChildren } from './disable-connection-children';
import { shouldCascade } from './should-cascade';

/**
 * Quando uma conexão é "excluída" (soft delete), desativa os contatos e as mensagens dela.
 * Sem subcoleções não existe exclusão recursiva: a cascata é feita aqui, no backend.
 */
export const onConnectionDisabled = onDocumentUpdated(
  'connections/{connectionId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after || !shouldCascade(before, after)) return;

    const counts = await disableConnectionChildren(db, {
      connectionId: event.params.connectionId,
      tenantId: after.tenantId as string,
      deletedAt: (after.deletedAt as Timestamp | null) ?? Timestamp.now(),
    });
    logger.info('Conexão desativada: contatos e mensagens desativados', {
      connectionId: event.params.connectionId,
      ...counts,
    });
  },
);
