import { createTheme } from '@mui/material/styles';
import { ptBR as coreLocale } from '@mui/material/locale';
import { ptBR as datePickersLocale } from '@mui/x-date-pickers/locales';

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      primary: { main: '#1565c0' },
      secondary: { main: '#00897b' },
      background: { default: '#f5f7fa' },
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
