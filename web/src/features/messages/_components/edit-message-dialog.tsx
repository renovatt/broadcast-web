import dayjs from 'dayjs';
import { FirebaseError } from 'firebase/app';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { Contact } from '@/features/contacts/types/contact';
import { formatDateTime } from '@/shared/utils/date';
import { getFirestoreErrorMessage } from '@/shared/utils/firestore';
import { withFeedback } from '@/shared/utils/with-feedback';
import { updateScheduledMessage } from '../api/messages-api';
import type { Message, MessageInput } from '../types/message';
import { MessageForm } from './message-form';

type EditMessageDialogProps = {
  /** Sempre uma mensagem agendada (só elas podem ser editadas). */
  message: Message;
  contacts: readonly Contact[];
  onClose: () => void;
};

const saveErrorMessage = (error: unknown) =>
  error instanceof FirebaseError && error.code === 'permission-denied'
    ? 'Não foi possível salvar: a mensagem pode já ter sido enviada.'
    : getFirestoreErrorMessage(error);

export const EditMessageDialog = ({ message, contacts, onClose }: EditMessageDialogProps) => {
  const activeIds = new Set(contacts.map(({ id }) => id));
  const recipientIds = message.recipientIds.filter((id) => activeIds.has(id));
  const removedCount = message.recipientIds.length - recipientIds.length;

  const save = async (input: MessageInput) => {
    await withFeedback(
      () => updateScheduledMessage(message.id, input),
      input.mode === 'now'
        ? 'Mensagem enviada.'
        : `Agendamento atualizado para ${formatDateTime(input.scheduledAt)}.`,
      saveErrorMessage,
    );
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="edit-message-title">
      <DialogTitle id="edit-message-title">Editar mensagem agendada</DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2!">
        {removedCount > 0 && (
          <Alert severity="info">
            {removedCount === 1
              ? '1 destinatário foi excluído dos contatos e não receberá esta mensagem.'
              : `${removedCount} destinatários foram excluídos dos contatos e não receberão esta mensagem.`}
          </Alert>
        )}
        <MessageForm
          contacts={contacts}
          defaultValues={{
            recipientIds,
            body: message.body,
            mode: 'schedule',
            scheduledAt: message.scheduledAt ? dayjs(message.scheduledAt.toDate()) : null,
          }}
          onSubmit={save}
          renderActions={({ isSubmitting, mode }) => (
            <div className="flex justify-end gap-2">
              <Button onClick={onClose} disabled={isSubmitting} color="inherit">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                {mode === 'now' ? 'Enviar agora' : 'Salvar agendamento'}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};
