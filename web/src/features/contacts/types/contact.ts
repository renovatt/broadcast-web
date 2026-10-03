import type { DocumentLifecycle } from '@/shared/types/document-lifecycle';

/** Coleção raiz `contacts`. Ligada a uma conexão por `connectionId` (sem subcoleções). */
export type Contact = DocumentLifecycle & {
  id: string;
  tenantId: string;
  connectionId: string;
  name: string;
  /** Telefone normalizado em E.164, ex.: +5511999998888 */
  phone: string;
};

export type ContactInput = Pick<Contact, 'name' | 'phone'>;
