import type { Timestamp } from 'firebase/firestore';

/** Coleção raiz `connections`. Pertence a um cliente (tenant). */
export type Connection = {
  id: string;
  tenantId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ConnectionInput = Pick<Connection, 'name'>;
