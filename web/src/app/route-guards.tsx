import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AppLayout } from '@/components/app-layout';
import { LoadingScreen } from '@/components/loading-screen';
import { signOut } from '@/features/auth/api/auth-api';
import { notify } from '@/shared/stores/notification-store';

export const HOME_PATH = '/connections';

type RedirectState = { from?: string } | null;

const handleSignOut = () =>
  signOut().catch(() => notify.error('Não foi possível sair. Tente novamente.'));

/**
 * Só deixa passar usuários autenticados (dentro do layout com a barra superior);
 * os demais vão para o login, lembrando a rota de origem.
 */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return (
    <AppLayout user={user} homePath={HOME_PATH} onSignOut={handleSignOut}>
      <Outlet />
    </AppLayout>
  );
};

/** Login e cadastro: usuário já autenticado volta para onde estava (ou para a home). */
export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  const state = useLocation().state as RedirectState;

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={state?.from ?? HOME_PATH} replace />;
  return <Outlet />;
};
