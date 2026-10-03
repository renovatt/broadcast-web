import { afterEach, describe, expect, it, vi } from 'vitest';
import { areFunctionsEnabled } from '../utils/backend';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('areFunctionsEnabled', () => {
  it('é true por padrão (variável ausente)', () => {
    vi.stubEnv('VITE_FUNCTIONS_ENABLED', undefined);
    expect(areFunctionsEnabled()).toBe(true);
  });

  it('é false só com o valor explícito "false"', () => {
    vi.stubEnv('VITE_FUNCTIONS_ENABLED', 'false');
    expect(areFunctionsEnabled()).toBe(false);
  });

  it('qualquer outro valor mantém habilitado', () => {
    vi.stubEnv('VITE_FUNCTIONS_ENABLED', 'true');
    expect(areFunctionsEnabled()).toBe(true);
  });
});
