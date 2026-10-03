import { create } from 'zustand';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export type Notification = {
  id: number;
  message: string;
  severity: NotificationSeverity;
};

type NotificationState = {
  notification: Notification | null;
  notify: (message: string, severity?: NotificationSeverity) => void;
  dismiss: () => void;
};

let nextId = 1;

/** Feedback global (snackbar). Uma notificação por vez: a mais recente substitui a anterior. */
export const useNotificationStore = create<NotificationState>()((set) => ({
  notification: null,
  notify: (message, severity = 'success') =>
    set({ notification: { id: nextId++, message, severity } }),
  dismiss: () => set({ notification: null }),
}));

/** Atalhos para usar fora de componentes (ex.: em handlers assíncronos). */
export const notify = {
  success: (message: string) => useNotificationStore.getState().notify(message, 'success'),
  error: (message: string) => useNotificationStore.getState().notify(message, 'error'),
  info: (message: string) => useNotificationStore.getState().notify(message, 'info'),
};
