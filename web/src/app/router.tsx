import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from '@/features/auth/pages/login-page';
import { SignupPage } from '@/features/auth/pages/signup-page';
import { ConnectionsPage } from '@/features/connections/pages/connections-page';
import { HOME_PATH, ProtectedRoute, PublicOnlyRoute } from './route-guards';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: HOME_PATH, element: <ConnectionsPage /> }],
  },
  { path: '*', element: <Navigate to={HOME_PATH} replace /> },
]);
