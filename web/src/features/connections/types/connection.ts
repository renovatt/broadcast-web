import type { DocumentLifecycle } from '@/shared/types/document-lifecycle';

/** Coleção raiz `connections`. Pertence a um cliente (tenant). */
export type Connection = DocumentLifecycle & {
  id: string;
  tenantId: string;
  name: string;
};

export type ConnectionInput = Pick<Connection, 'name'>;
