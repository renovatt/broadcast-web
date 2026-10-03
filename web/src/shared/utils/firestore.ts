import { FirebaseError } from 'firebase/app';
import { serverTimestamp, where, type DocumentSnapshot } from 'firebase/firestore';

/**
 * Converte um documento em objeto do domínio com `id`.
 * `serverTimestamps: 'estimate'` evita `null` em createdAt/updatedAt enquanto a escrita local
 * ainda não foi confirmada pelo servidor (compensação de latência do tempo real).
 */
export const fromSnapshot = <T extends { id: string }>(snapshot: DocumentSnapshot): T =>
  ({ id: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) }) as T;

/** Campos de todo documento novo: ativo, sem exclusão e com timestamps do servidor. */
export const newDocumentFields = () => ({
  enabled: true,
  deletedAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

/** "Excluir" = desativar (soft delete). As rules proíbem apagar documentos de verdade. */
export const softDeleteFields = () => ({
  enabled: false,
  deletedAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

/** Filtro de toda consulta do app: somente documentos ativos. */
export const onlyActive = () => where('enabled', '==', true);

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'Você não tem permissão para acessar estes dados.',
  'not-found': 'O registro não existe mais.',
  unavailable: 'Sem conexão com o servidor. Verifique sua internet.',
  // Em consultas, quase sempre é um índice composto ausente ou ainda em construção.
  'failed-precondition':
    'O banco de dados ainda está preparando esta consulta (índice em criação). Tente novamente em alguns minutos.',
  'deadline-exceeded': 'O servidor demorou para responder. Tente novamente.',
};

export const getFirestoreErrorMessage = (error: unknown) =>
  (error instanceof FirebaseError && FIRESTORE_ERROR_MESSAGES[error.code]) ||
  'Não foi possível concluir. Tente novamente.';
