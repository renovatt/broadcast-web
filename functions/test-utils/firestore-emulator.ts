import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'demo-broadcast';

/**
 * Firestore do emulador para os testes de integração.
 * Trava de segurança: sem FIRESTORE_EMULATOR_HOST os testes não rodam — nunca tocam no projeto real.
 */
export const emulatorDb = (): Firestore => {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) {
    throw new Error('FIRESTORE_EMULATOR_HOST não definido. Rode pela raiz: npm run test:functions');
  }
  if (getApps().length === 0) initializeApp({ projectId: PROJECT_ID });
  return getFirestore();
};

/** Apaga todos os documentos do emulador entre os testes. */
export const clearEmulator = async () => {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const response = await fetch(
    `http://${host}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  if (!response.ok) throw new Error(`Falha ao limpar o emulador: ${response.status}`);
};

const MINUTE = 60 * 1000;

/** Timestamp relativo a "agora" (minutos negativos = passado). */
export const minutesFromNow = (minutes: number) =>
  Timestamp.fromMillis(Date.now() + minutes * MINUTE);

export const activeFields = () => {
  const now = Timestamp.now();
  return { enabled: true, deletedAt: null, createdAt: now, updatedAt: now };
};
