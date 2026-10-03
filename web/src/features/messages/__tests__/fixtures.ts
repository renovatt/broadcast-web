import type { Timestamp } from 'firebase/firestore';
import type { Contact } from '@/features/contacts/types/contact';
import type { Message } from '../types/message';

/** Timestamp do Firestore simulado (só o que o app usa). */
export const timestamp = (date: Date) =>
  ({ toDate: () => date, toMillis: () => date.getTime() }) as unknown as Timestamp;

export const contacts = [
  { id: 'k1', name: 'Ana', phone: '+5511911110001' },
  { id: 'k2', name: 'Bruno', phone: '+5511911110002' },
  { id: 'k3', name: 'Carla', phone: '+5511911110003' },
] as Contact[];

const base = {
  tenantId: 'u1',
  connectionId: 'c1',
  enabled: true,
  deletedAt: null,
  updatedAt: timestamp(new Date(2026, 9, 3, 10, 0)),
};

export const sentMessage = {
  ...base,
  id: 'm1',
  body: 'Promoção de outubro',
  recipientIds: ['k1', 'k2'],
  recipients: [
    { id: 'k1', name: 'Ana', phone: '+5511911110001' },
    { id: 'k2', name: 'Bruno', phone: '+5511911110002' },
  ],
  status: 'sent',
  scheduledAt: null,
  sentAt: timestamp(new Date(2026, 9, 3, 10, 12)),
  createdAt: timestamp(new Date(2026, 9, 3, 10, 12)),
} as Message;

export const scheduledMessage = {
  ...base,
  id: 'm2',
  body: 'Lembrete da reunião',
  recipientIds: ['k1', 'k2', 'k3'],
  recipients: [
    { id: 'k1', name: 'Ana', phone: '+5511911110001' },
    { id: 'k2', name: 'Bruno', phone: '+5511911110002' },
    { id: 'k3', name: 'Carla', phone: '+5511911110003' },
  ],
  status: 'scheduled',
  scheduledAt: timestamp(new Date(2030, 9, 5, 14, 30)),
  sentAt: null,
  createdAt: timestamp(new Date(2026, 9, 3, 11, 0)),
} as Message;
