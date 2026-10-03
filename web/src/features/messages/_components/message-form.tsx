import type { ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { RhfDateTimePicker } from '@/components/rhf/rhf-date-time-picker';
import { RhfTextField } from '@/components/rhf/rhf-text-field';
import type { Contact } from '@/features/contacts/types/contact';
import {
  MAX_BODY_LENGTH,
  MIN_SCHEDULE_AHEAD_MINUTES,
  messageSchema,
  type MessageFormValues,
} from '../schemas/message-schemas';
import type { MessageInput } from '../types/message';
import { toRecipients } from '../utils/recipients';
import { RecipientPicker } from './recipient-picker';

export type MessageFormMode = MessageFormValues['mode'];

type MessageFormProps = {
  contacts: readonly Contact[];
  defaultValues?: Partial<MessageFormValues>;
  /** Recebe o input pronto para a API. Deve notificar e lançar o erro se falhar. */
  onSubmit: (input: MessageInput) => Promise<void>;
  /** Limpa o formulário após salvar (compositor); a edição fecha o diálogo. */
  resetOnSuccess?: boolean;
  renderActions: (state: { isSubmitting: boolean; mode: MessageFormMode }) => ReactNode;
};

const EMPTY: MessageFormValues = { recipientIds: [], body: '', mode: 'now', scheduledAt: null };

/** Formulário de mensagem: destinatários, texto e envio imediato ou agendado. */
export const MessageForm = ({
  contacts,
  defaultValues,
  onSubmit,
  resetOnSuccess = false,
  renderActions,
}: MessageFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });
  const mode = useWatch({ control, name: 'mode' });
  const body = useWatch({ control, name: 'body' });

  const submit = handleSubmit(async (values) => {
    const recipients = toRecipients(contacts, values.recipientIds);
    if (recipients.length === 0) {
      setError('recipientIds', { message: 'Os contatos selecionados não existem mais.' });
      return;
    }
    const input: MessageInput =
      values.mode === 'schedule' && values.scheduledAt
        ? {
            body: values.body,
            recipients,
            mode: 'schedule',
            scheduledAt: values.scheduledAt.toDate(),
          }
        : { body: values.body, recipients, mode: 'now' };
    try {
      await onSubmit(input);
      if (resetOnSuccess) reset(EMPTY);
    } catch {
      // Quem chama já notificou o erro; os valores digitados são mantidos.
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Controller
        control={control}
        name="recipientIds"
        render={({ field, fieldState }) => (
          <RecipientPicker
            contacts={contacts}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <RhfTextField
        name="body"
        control={control}
        label="Mensagem"
        multiline
        minRows={4}
        maxRows={10}
        helperText={`${body.length}/${MAX_BODY_LENGTH}`}
        slotProps={{ htmlInput: { maxLength: MAX_BODY_LENGTH } }}
      />

      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <RadioGroup row aria-label="Quando enviar" {...field}>
            <FormControlLabel value="now" control={<Radio />} label="Enviar agora" />
            <FormControlLabel value="schedule" control={<Radio />} label="Agendar" />
          </RadioGroup>
        )}
      />

      {mode === 'schedule' && (
        <RhfDateTimePicker
          name="scheduledAt"
          control={control}
          label="Data e horário do envio"
          disablePast
          minDateTime={dayjs().add(MIN_SCHEDULE_AHEAD_MINUTES, 'minute')}
          helperText="A mensagem será enviada automaticamente, mesmo com o app fechado."
        />
      )}

      {renderActions({ isSubmitting, mode })}
    </form>
  );
};
