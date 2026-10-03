import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// O setup global substitui '@/lib/firebase' por um stub; aqui testamos o módulo real.
vi.unmock('@/lib/firebase');

vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/auth')>()),
  connectAuthEmulator: vi.fn(),
}));
vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  connectFirestoreEmulator: vi.fn(),
}));

const loadModule = () => import('../firebase');

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('lib/firebase', () => {
  it('inicializa app, auth e firestore com a config do ambiente', async () => {
    const { app, auth, db } = await loadModule();
    expect(app.options.projectId).toBe('demo-test');
    expect(auth.app).toBe(app);
    expect(db.app).toBe(app);
  });

  it('falha com mensagem clara quando falta configuração', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');
    await expect(loadModule()).rejects.toThrow(
      'Configuração do Firebase incompleta (apiKey, appId). Veja web/.env.example.',
    );
  });

  it('não conecta aos emuladores por padrão', async () => {
    await loadModule();
    expect(connectAuthEmulator).not.toHaveBeenCalled();
    expect(connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('conecta Auth e Firestore aos emuladores quando VITE_USE_EMULATORS=true', async () => {
    vi.stubEnv('VITE_USE_EMULATORS', 'true');
    const { auth, db } = await loadModule();
    expect(connectAuthEmulator).toHaveBeenCalledWith(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(db, '127.0.0.1', 8080);
  });
});
