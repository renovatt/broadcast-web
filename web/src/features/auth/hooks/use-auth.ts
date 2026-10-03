import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/auth-store';

export const useAuth = () => useAuthStore(useShallow(({ user, loading }) => ({ user, loading })));

/** Para rotas protegidas: garante que existe um usuário autenticado. */
export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) throw new Error('useCurrentUser exige um usuário autenticado.');
  return user;
};
