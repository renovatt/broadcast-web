import type { DocumentLifecycle } from '@/shared/types/document-lifecycle';

/** Resumo mantido pela Cloud Function (somente itens ativos). Só o backend grava. */
export type ConnectionStats = {
  contacts: number;
  sent: number;
  scheduled: number;
};

/** Coleção raiz `connections`. Pertence a um cliente (tenant). */
export type Connection = DocumentLifecycle & {
  id: string;
  tenantId: string;
  name: string;
  /** Ausente até o primeiro contato/mensagem: equivale a tudo zerado. */
  stats?: ConnectionStats;
};

export type ConnectionInput = Pick<Connection, 'name'>;
