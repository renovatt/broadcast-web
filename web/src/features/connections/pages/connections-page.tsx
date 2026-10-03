import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { notify } from '@/shared/stores/notification-store';
import { getFirestoreErrorMessage } from '@/shared/utils/firestore';
import { deleteConnection } from '../api/connections-api';
import { ConnectionCard } from '../_components/connection-card';
import { ConnectionFormDialog } from '../_components/connection-form-dialog';
import { useConnections } from '../hooks/use-connections';
import type { Connection } from '../types/connection';

type FormState = { mode: 'create' } | { mode: 'edit'; connection: Connection } | null;

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

export const ConnectionsPage = () => {
  const { data: connections, loading, error } = useConnections();
  const [form, setForm] = useState<FormState>(null);
  const [toDelete, setToDelete] = useState<Connection | null>(null);

  const openCreate = () => setForm({ mode: 'create' });

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteConnection(toDelete.id);
      notify.success('Conexão excluída.');
    } catch (deleteError) {
      notify.error(getFirestoreErrorMessage(deleteError));
      throw deleteError;
    }
  };

  const renderContent = () => {
    if (error) return <Alert severity="error">{getFirestoreErrorMessage(error)}</Alert>;
    if (loading || !connections) {
      return (
        <div className={GRID} aria-busy="true" aria-label="Carregando conexões">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} variant="rounded" height={132} />
          ))}
        </div>
      );
    }
    if (connections.length === 0) {
      return (
        <EmptyState
          icon={<HubIcon />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
          action={
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
              Criar conexão
            </Button>
          }
        />
      );
    }
    return (
      <ul className={`${GRID} m-0 list-none p-0`} aria-label="Conexões">
        {connections.map((connection) => (
          <li key={connection.id}>
            <ConnectionCard
              connection={connection}
              onEdit={(selected) => setForm({ mode: 'edit', connection: selected })}
              onDelete={setToDelete}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <PageHeader
        title="Conexões"
        subtitle="Cada conexão tem seus próprios contatos e mensagens."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova conexão
          </Button>
        }
      />

      {renderContent()}

      {form && (
        <ConnectionFormDialog
          connection={form.mode === 'edit' ? form.connection : undefined}
          onClose={() => setForm(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Excluir "${toDelete?.name ?? ''}"?`}
        description="Os contatos e as mensagens desta conexão também serão excluídos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
