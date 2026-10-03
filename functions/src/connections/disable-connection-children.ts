import { FieldValue, type Firestore, type Timestamp } from 'firebase-admin/firestore';

/** Coleções que pertencem a uma conexão (ligadas por `connectionId`, sem subcoleções). */
export const CHILD_COLLECTIONS = ['contacts', 'messages'] as const;

type ChildCollection = (typeof CHILD_COLLECTIONS)[number];

export type DisableChildrenInput = {
  connectionId: string;
  tenantId: string;
  /** Mesmo `deletedAt` da conexão: tudo que foi "excluído junto" tem a mesma marca de tempo. */
  deletedAt: Timestamp;
};

/**
 * Cascata do soft delete: desativa os contatos e as mensagens ativos de uma conexão.
 * Mensagens agendadas desativadas deixam de ser enviadas. Idempotente: só toca em `enabled == true`.
 */
export const disableConnectionChildren = async (
  db: Firestore,
  { connectionId, tenantId, deletedAt }: DisableChildrenInput,
): Promise<Record<ChildCollection, number>> => {
  const writer = db.bulkWriter();
  const counts = { contacts: 0, messages: 0 };

  for (const collection of CHILD_COLLECTIONS) {
    const snapshot = await db
      .collection(collection)
      .where('tenantId', '==', tenantId)
      .where('connectionId', '==', connectionId)
      .where('enabled', '==', true)
      .get();

    for (const child of snapshot.docs) {
      void writer.update(child.ref, {
        enabled: false,
        deletedAt,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    counts[collection] = snapshot.size;
  }

  await writer.close();
  return counts;
};
