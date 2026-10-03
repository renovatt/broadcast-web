import type { Timestamp } from 'firebase/firestore';
import type { Contact } from '@/features/contacts/types/contact';

export type MessageStatus = 'scheduled' | 'sent';

/** Cópia dos dados do contato no momento do envio: o histórico não muda se o contato for editado/excluído. */
export type Recipient = Pick<Contact, 'id' | 'name' | 'phone'>;

/** Coleção raiz `messages`. Ligada a uma conexão por `connectionId` (sem subcoleções). */
export type Message = {
  id: string;
  tenantId: string;
  connectionId: string;
  body: string;
  recipientIds: string[];
  recipients: Recipient[];
  status: MessageStatus;
  /** Preenchido apenas para mensagens agendadas. */
  scheduledAt: Timestamp | null;
  /** Preenchido quando a mensagem é enviada (na hora ou pela Cloud Function). */
  sentAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MessageInput = {
  body: string;
  recipients: Recipient[];
} & ({ mode: 'now' } | { mode: 'schedule'; scheduledAt: Date });
