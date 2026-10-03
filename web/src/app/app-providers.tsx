import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { NotificationSnackbar } from '@/components/notification-snackbar';
import { theme } from './theme';

type AppProvidersProps = { children: ReactNode };

export const AppProviders = ({ children }: AppProvidersProps) => (
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        {children}
        <NotificationSnackbar />
      </LocalizationProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);
