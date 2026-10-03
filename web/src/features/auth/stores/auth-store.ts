import { create } from 'zustand';
import type { AuthUser } from '../types/auth-user';

type AuthState = {
  user: AuthUser | null;
  /** true até o Firebase informar o estado inicial da sessão. */
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
}));
