import type { User } from 'firebase/auth';
import type { AuthUser } from '../types/auth-user';

/** Extrai do User do Firebase apenas os dados que o app usa (objeto simples e serializável). */
export const toAuthUser = (user: User | null): AuthUser | null =>
  user && { uid: user.uid, email: user.email, displayName: user.displayName };
