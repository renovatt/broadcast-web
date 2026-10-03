import { defineConfig } from 'vitest/config';

// Testes de integração contra o emulador do Firestore (Admin SDK real, sem mocks do banco).
// Rodar pela raiz: `npm run test:functions` (sobe o emulador via firebase emulators:exec).
export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
