import type { Timestamp } from 'firebase/firestore';

/**
 * Campos comuns a todos os documentos: auditoria e soft delete.
 * Nada é apagado de verdade: "excluir" define `enabled: false` e `deletedAt`.
 */
export type DocumentLifecycle = {
  enabled: boolean;
  deletedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
