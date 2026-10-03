import type { DocumentData } from 'firebase-admin/firestore';

/**
 * O resumo da conexão só muda quando um contato/mensagem é criado, apagado, ativado/desativado
 * ou troca de status (agendada → enviada). Editar texto ou nome não exige recálculo.
 */
export const affectsStats = (
  before: DocumentData | undefined,
  after: DocumentData | undefined,
): boolean => {
  if (!before || !after) return Boolean(before ?? after);
  return before.enabled !== after.enabled || before.status !== after.status;
};

/** A conexão do documento (antes ou depois da escrita). */
export const connectionIdOf = (
  before: DocumentData | undefined,
  after: DocumentData | undefined,
): string | undefined => (after?.connectionId ?? before?.connectionId) as string | undefined;
