import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useNotificationStore } from '@/shared/stores/notification-store';

/** Exibe a notificação global atual. Renderizado uma vez, nos providers do app. */
export const NotificationSnackbar = () => {
  const notification = useNotificationStore((state) => state.notification);
  const dismiss = useNotificationStore((state) => state.dismiss);

  return (
    <Snackbar
      key={notification?.id}
      open={Boolean(notification)}
      autoHideDuration={4000}
      onClose={(_, reason) => reason !== 'clickaway' && dismiss()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {notification ? (
        <Alert
          variant="filled"
          severity={notification.severity}
          onClose={dismiss}
          className="w-full"
        >
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};
