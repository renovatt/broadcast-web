import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';
import LogoutIcon from '@mui/icons-material/Logout';

type AppLayoutUser = {
  displayName: string | null;
  email: string | null;
};

type AppLayoutProps = {
  user: AppLayoutUser;
  homePath: string;
  onSignOut: () => void;
  children: ReactNode;
};

const initialsOf = ({ displayName, email }: AppLayoutUser) =>
  (displayName ?? email ?? '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Estrutura das telas autenticadas: barra superior com a marca e o menu da conta. */
export const AppLayout = ({ user, homePath, onSignOut, children }: AppLayoutProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <div className="flex min-h-screen flex-col">
      <AppBar position="sticky" color="inherit" elevation={0} className="border-b border-gray-200">
        <Toolbar disableGutters className="mx-auto w-full max-w-6xl gap-2 px-4">
          <RouterLink
            to={homePath}
            className="flex items-center gap-2 text-inherit no-underline"
            aria-label="Broadcast — início"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-(--mui-palette-primary-main) text-white">
              <CampaignIcon fontSize="small" />
            </span>
            <Typography variant="h6" component="span" className="font-bold">
              Broadcast
            </Typography>
          </RouterLink>

          <div className="ml-auto flex items-center gap-2">
            <Typography variant="body2" color="text.secondary" className="hidden! sm:block!">
              {user.displayName ?? user.email}
            </Typography>
            <IconButton
              aria-label="Conta"
              aria-controls={menuAnchor ? 'account-menu' : undefined}
              aria-haspopup="true"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <Avatar className="size-8! bg-(--mui-palette-secondary-main)! text-sm!">
                {initialsOf(user)}
              </Avatar>
            </IconButton>
          </div>

          <Menu
            id="account-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <div className="px-4 py-2">
              {user.displayName && (
                <Typography variant="subtitle2" noWrap>
                  {user.displayName}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </div>
            <Divider />
            <MenuItem
              onClick={() => {
                closeMenu();
                onSignOut();
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
};
