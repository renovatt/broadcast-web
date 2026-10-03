import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { signOut } from '@/features/auth/api/auth-api';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

// Provisório (Fase 3): a listagem de conexões e o layout com AppBar entram nas Fases 4 e 5.
export const ConnectionsPage = () => {
  const user = useCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Typography variant="h5" component="h1">
        Olá, {user.displayName ?? user.email}
      </Typography>
      <Button variant="outlined" onClick={signOut}>
        Sair
      </Button>
    </main>
  );
};
