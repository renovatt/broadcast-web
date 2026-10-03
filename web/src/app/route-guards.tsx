import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingScreen } from '@/components/loading-screen';

export const HOME_PATH = '/connections';

type RedirectState = { from?: string } | null;

/** Só deixa passar usuários autenticados; os demais vão para o login (lembrando a rota de origem). */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};

/** Login e cadastro: usuário já autenticado volta para onde estava (ou para a home). */
export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  const state = useLocation().state as RedirectState;

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={state?.from ?? HOME_PATH} replace />;
  return <Outlet />;
};
