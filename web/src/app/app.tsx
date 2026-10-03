import { RouterProvider } from 'react-router';
import { useAuthListener } from '@/features/auth/hooks/use-auth-listener';
import { AppProviders } from './app-providers';
import { router } from './router';

export const App = () => {
  useAuthListener();

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};
