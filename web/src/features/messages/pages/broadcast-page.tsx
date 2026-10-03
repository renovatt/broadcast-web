import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useCurrentConnection } from '@/features/connections/hooks/use-connection';
import { useContacts } from '@/features/contacts/hooks/use-contacts';
import { notify } from '@/shared/stores/notification-store';
import { getFirestoreErrorMessage } from '@/shared/utils/firestore';
import { withFeedback } from '@/shared/utils/with-feedback';
import { deleteMessage } from '../api/messages-api';
import { EditMessageDialog } from '../_components/edit-message-dialog';
import { MessageComposer } from '../_components/message-composer';
import { MessageHistory } from '../_components/message-history';
import { useMessages } from '../hooks/use-messages';
import type { Message } from '../types/message';
import type { MessageFilter } from '../utils/message-filters';

export const BroadcastPage = () => {
  const connection = useCurrentConnection();
  const contacts = useContacts(connection.id);
  const messages = useMessages(connection.id);
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);

  // A mensagem em edição vem da lista em tempo real: se for enviada (pela Cloud Function)
  // ou excluída em outra aba enquanto o diálogo está aberto, o diálogo fecha e avisa.
  const editing = messages.data?.find(({ id }) => id === editingId);
  const editable = editing?.status === 'scheduled' ? editing : undefined;
  const editingLost = editingId !== null && messages.data !== undefined && !editable;

  useEffect(() => {
    if (editingLost) notify.info('A mensagem foi enviada ou excluída enquanto você editava.');
  }, [editingLost]);

  const confirmDelete = async () => {
    if (toDelete) await withFeedback(() => deleteMessage(toDelete.id), 'Mensagem excluída.');
  };

  const renderComposer = () => {
    if (contacts.error) {
      return <Alert severity="error">{getFirestoreErrorMessage(contacts.error)}</Alert>;
    }
    if (contacts.loading || !contacts.data) {
      return <Skeleton variant="rounded" height={360} aria-label="Carregando contatos" />;
    }
    return <MessageComposer connectionId={connection.id} contacts={contacts.data} />;
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-2">{renderComposer()}</div>

      <div className="min-w-0 lg:col-span-3">
        <MessageHistory
          messages={messages.data}
          loading={messages.loading}
          error={messages.error}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={(message) => setEditingId(message.id)}
          onDelete={setToDelete}
        />
      </div>

      {editable && (
        <EditMessageDialog
          key={editable.id}
          message={editable}
          contacts={contacts.data ?? []}
          onClose={() => setEditingId(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir mensagem?"
        description={
          toDelete?.status === 'scheduled'
            ? 'O agendamento será cancelado e a mensagem não será enviada.'
            : 'A mensagem sairá do histórico desta conexão.'
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};
