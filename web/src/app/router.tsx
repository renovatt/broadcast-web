import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from '@/features/auth/pages/login-page';
import { SignupPage } from '@/features/auth/pages/signup-page';
import { ConnectionLayout } from '@/features/connections/pages/connection-layout';
import { ConnectionsPage } from '@/features/connections/pages/connections-page';
import { ContactsPage } from '@/features/contacts/pages/contacts-page';
import { BroadcastPage } from '@/features/messages/pages/broadcast-page';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute, PublicOnlyRoute } from './route-guards';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.signup, element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: ROUTES.connections, element: <ConnectionsPage /> },
      {
        path: `${ROUTES.connections}/:connectionId`,
        element: <ConnectionLayout />,
        children: [
          { index: true, element: <Navigate to="contacts" replace /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'broadcast', element: <BroadcastPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.connections} replace /> },
]);
