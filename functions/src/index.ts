import { setGlobalOptions } from 'firebase-functions';

// Mesma região do Firestore (southamerica-east1): exigido pelos triggers do Firestore.
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 5 });

export { dispatchScheduledMessages } from './messages/dispatch-scheduled-messages';
export { onConnectionDisabled } from './connections/on-connection-disabled';
export { onContactWritten, onMessageWritten } from './connections/on-connection-child-written';
