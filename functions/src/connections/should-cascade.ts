import type { DocumentData } from 'firebase-admin/firestore';

/** A cascata só roda na transição ativa → desativada (o "excluir" da conexão). */
export const shouldCascade = (
  before: DocumentData | undefined,
  after: DocumentData | undefined,
): boolean => before?.enabled === true && after?.enabled === false;
