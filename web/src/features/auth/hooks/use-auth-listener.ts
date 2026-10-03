import { useEffect } from 'react';
import { subscribeToAuthChanges } from '../api/auth-api';
import { useAuthStore } from '../stores/auth-store';
import { toAuthUser } from '../utils/to-auth-user';

/** Mantém o auth store sincronizado com a sessão do Firebase. Usar uma vez, na raiz do app. */
export const useAuthListener = () => {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(
    () => subscribeToAuthChanges((firebaseUser) => setUser(toAuthUser(firebaseUser))),
    [setUser],
  );
};
