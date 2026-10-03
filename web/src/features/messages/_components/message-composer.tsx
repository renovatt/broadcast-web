import { Link as RouterLink } from 'react-router';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import type { Contact } from '@/features/contacts/types/contact';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/utils/date';
import { withFeedback } from '@/shared/utils/with-feedback';
import { createMessage } from '../api/messages-api';
import type { MessageInput } from '../types/message';
import { MessageForm } from './message-form';

type MessageComposerProps = {
  connectionId: string;
  contacts: readonly Contact[];
};

export const MessageComposer = ({ connectionId, contacts }: MessageComposerProps) => {
  const { uid } = useCurrentUser();

  const send = async (input: MessageInput) => {
    await withFeedback(
      () => createMessage(uid, connectionId, input),
      input.mode === 'now'
        ? 'Mensagem enviada.'
        : `Mensagem agendada para ${formatDateTime(input.scheduledAt)}.`,
    );
  };

  return (
    <Card component="section" aria-labelledby="composer-title">
      <CardContent className="flex flex-col gap-4">
        <Typography id="composer-title" variant="h6" component="h2">
          Nova mensagem
        </Typography>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <Typography variant="body2" color="text.secondary">
              Esta conexão ainda não tem contatos. Adicione contatos para enviar mensagens.
            </Typography>
            <Button component={RouterLink} to={ROUTES.contacts(connectionId)} variant="outlined">
              Adicionar contatos
            </Button>
          </div>
        ) : (
          <MessageForm
            contacts={contacts}
            onSubmit={send}
            resetOnSuccess
            renderActions={({ isSubmitting, mode }) => (
              <Button
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                startIcon={mode === 'now' ? <SendIcon /> : <ScheduleSendIcon />}
              >
                {mode === 'now' ? 'Enviar agora' : 'Agendar envio'}
              </Button>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};
