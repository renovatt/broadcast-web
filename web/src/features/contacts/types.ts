import type { Timestamp } from 'firebase/firestore';

/** Coleção raiz `contacts`. Ligada a uma conexão por `connectionId` (sem subcoleções). */
export type Contact = {
  id: string;
  tenantId: string;
  connectionId: string;
  name: string;
  /** Telefone normalizado em E.164, ex.: +5511999998888 */
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ContactInput = Pick<Contact, 'name' | 'phone'>;
