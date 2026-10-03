import {
  FieldValue,
  Timestamp,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

export const DISPATCH_PAGE_SIZE = 500;

export type DispatchResult = {
  /** Mensagens marcadas como enviadas. */
  dispatched: number;
  /** Mensagens que mudaram entre a leitura e a escrita (editadas/excluídas) e foram ignoradas. */
  skipped: number;
};

/**
 * Envio simulado: marca como enviadas as mensagens agendadas e ativas cujo horário já chegou.
 *
 * - Idempotente: só toca em `status == 'scheduled'`; rodar de novo não reenvia nada.
 * - Seguro contra concorrência: cada escrita usa a precondição `lastUpdateTime` da leitura.
 *   Se o usuário editou ou excluiu a mensagem nesse meio-tempo, aquela escrita falha sozinha
 *   (sem afetar as outras) e a mensagem é reavaliada na próxima execução.
 * - Mensagens desativadas (soft delete) nunca são enviadas.
 */
export const dispatchDueMessages = async (
  db: Firestore,
  now: Timestamp = Timestamp.now(),
  pageSize: number = DISPATCH_PAGE_SIZE,
): Promise<DispatchResult> => {
  const result: DispatchResult = { dispatched: 0, skipped: 0 };
  const writer = db.bulkWriter();
  // Precondição falhou = a mensagem mudou: não adianta tentar de novo.
  writer.onWriteError(() => false);

  const writes: Promise<void>[] = [];
  let cursor: QueryDocumentSnapshot | undefined;

  for (;;) {
    let query = db
      .collection('messages')
      .where('enabled', '==', true)
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now)
      .orderBy('scheduledAt')
      .limit(pageSize);
    if (cursor) query = query.startAfter(cursor);

    const page = await query.get();
    for (const message of page.docs) {
      writes.push(
        writer
          .update(
            message.ref,
            {
              status: 'sent',
              sentAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { lastUpdateTime: message.updateTime },
          )
          .then(
            () => {
              result.dispatched += 1;
            },
            () => {
              result.skipped += 1;
            },
          ),
      );
    }

    if (page.size < pageSize) break;
    cursor = page.docs[page.docs.length - 1];
  }

  await writer.close();
  await Promise.all(writes);
  return result;
};
