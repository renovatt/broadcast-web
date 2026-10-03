import { describe, expect, it } from 'vitest';
import type { User } from 'firebase/auth';
import { toAuthUser } from '../utils/to-auth-user';

describe('toAuthUser', () => {
  it('extrai apenas uid, email e displayName', () => {
    const firebaseUser = {
      uid: 'u1',
      email: 'joao@teste.com',
      displayName: 'João',
      emailVerified: true,
      getIdToken: () => Promise.resolve('token'),
    } as unknown as User;

    expect(toAuthUser(firebaseUser)).toEqual({
      uid: 'u1',
      email: 'joao@teste.com',
      displayName: 'João',
    });
  });

  it('retorna null quando não há usuário', () => {
    expect(toAuthUser(null)).toBeNull();
  });
});
