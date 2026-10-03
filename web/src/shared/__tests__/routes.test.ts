import { describe, expect, it } from 'vitest';
import { ROUTES } from '../constants/routes';

describe('ROUTES', () => {
  it('define as rotas fixas', () => {
    expect(ROUTES.login).toBe('/login');
    expect(ROUTES.signup).toBe('/signup');
    expect(ROUTES.connections).toBe('/connections');
  });

  it('monta as rotas de uma conexão', () => {
    expect(ROUTES.connection('abc')).toBe('/connections/abc');
    expect(ROUTES.contacts('abc')).toBe('/connections/abc/contacts');
    expect(ROUTES.broadcast('abc')).toBe('/connections/abc/broadcast');
  });
});
