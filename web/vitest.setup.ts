import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Nenhum teste de unidade conversa com o Firebase: a instância é substituída por um stub.
// Cada teste mocka as funções do SDK (firebase/auth, firebase/firestore) de que precisar.
vi.mock('@/lib/firebase', () => ({ app: {}, auth: { currentUser: null }, db: {} }));

afterEach(() => {
  cleanup();
});
