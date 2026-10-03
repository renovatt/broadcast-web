import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: { '@test-utils': fileURLToPath(new URL('./test-utils', import.meta.url)) },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      restoreMocks: true,
      // Variáveis fictícias: os testes nunca usam o projeto Firebase real.
      env: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'demo-test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'demo-test',
        VITE_FIREBASE_STORAGE_BUCKET: 'demo-test.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
        VITE_FIREBASE_APP_ID: '1:000000000000:web:test',
        VITE_USE_EMULATORS: 'false',
        // Fixo para não herdar o modo Spark do .env local; testes do modo sem functions usam vi.stubEnv.
        VITE_FUNCTIONS_ENABLED: 'true',
      },
    },
  }),
);
