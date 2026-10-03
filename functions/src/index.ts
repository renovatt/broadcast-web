import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 5 });

// As functions são registradas aqui conforme as fases avançam:
// - Fase 8: dispatchScheduledMessages (agendada) e onConnectionDeleted (cascata).
