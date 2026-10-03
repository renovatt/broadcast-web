import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/scheduler';
import { db } from '../lib/firestore';
import { dispatchDueMessages } from './dispatch-due-messages';

/**
 * A cada minuto, marca como enviadas as mensagens agendadas cujo horário chegou.
 * Roda no backend (Cloud Scheduler): não depende de o usuário estar com o app aberto.
 */
export const dispatchScheduledMessages = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'America/Sao_Paulo',
    // A próxima execução (em 1 minuto) já reprocessa o que ficou pendente.
    retryCount: 0,
  },
  async () => {
    const result = await dispatchDueMessages(db);
    if (result.dispatched > 0 || result.skipped > 0) {
      logger.info('Mensagens agendadas processadas', result);
    }
  },
);
