import { notify } from '../stores/notification-store';
import { getFirestoreErrorMessage } from './firestore';

/**
 * Executa uma escrita mostrando o toast de sucesso ou de erro.
 * O erro é relançado para quem chamou decidir o que fazer (ex.: manter um diálogo aberto).
 */
export const withFeedback = async <T>(
  action: () => Promise<T>,
  successMessage: string,
  errorMessage: (error: unknown) => string = getFirestoreErrorMessage,
): Promise<T> => {
  try {
    const result = await action();
    notify.success(successMessage);
    return result;
  } catch (error) {
    notify.error(errorMessage(error));
    throw error;
  }
};
