import { FieldValue, type Firestore } from 'firebase-admin/firestore';

/** Resumo exibido no card da conexão (somente itens ativos). */
export type ConnectionStats = {
  contacts: number;
  sent: number;
  scheduled: number;
};

/**
 * Recalcula o resumo de uma conexão a partir dos dados (count() do Firestore) e grava em
 * `connections/{id}.stats`. Por recalcular em vez de somar/subtrair, é idempotente: eventos
 * repetidos ou fora de ordem não deixam o contador errado. Roda em transação para não gravar
 * um valor antigo por cima de um recálculo mais novo.
 * Retorna `null` se a conexão não existe.
 */
export const refreshConnectionStats = (
  db: Firestore,
  connectionId: string,
): Promise<ConnectionStats | null> =>
  db.runTransaction(async (transaction) => {
    const connectionRef = db.doc(`connections/${connectionId}`);
    const connection = await transaction.get(connectionRef);
    if (!connection.exists) return null;

    const active = (collection: string) =>
      db
        .collection(collection)
        .where('connectionId', '==', connectionId)
        .where('enabled', '==', true);

    const [contacts, sent, scheduled] = await Promise.all([
      transaction.get(active('contacts').count()),
      transaction.get(active('messages').where('status', '==', 'sent').count()),
      transaction.get(active('messages').where('status', '==', 'scheduled').count()),
    ]);

    const stats: ConnectionStats = {
      contacts: contacts.data().count,
      sent: sent.data().count,
      scheduled: scheduled.data().count,
    };
    // Não altera `updatedAt`: ele representa edições do usuário (nome da conexão).
    transaction.update(connectionRef, { stats, statsUpdatedAt: FieldValue.serverTimestamp() });
    return stats;
  });
