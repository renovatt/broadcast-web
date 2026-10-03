import Typography from '@mui/material/Typography';
import { AppProviders } from './AppProviders';

export const App = () => (
  <AppProviders>
    <main className="flex min-h-screen items-center justify-center p-4">
      <Typography variant="h4" component="h1">
        Broadcast
      </Typography>
    </main>
  </AppProviders>
);
