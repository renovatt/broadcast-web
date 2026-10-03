import { createTheme } from '@mui/material/styles';
import { ptBR as coreLocale } from '@mui/material/locale';
import { ptBR as datePickersLocale } from '@mui/x-date-pickers/locales';

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      primary: { main: '#4F46E5' },
      secondary: { main: '#0EA5E9' },
      background: { default: '#F5F7FB' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Roboto, system-ui, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiCard: { defaultProps: { variant: 'outlined' } },
    },
  },
  coreLocale,
  datePickersLocale,
);
