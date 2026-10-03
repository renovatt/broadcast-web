import dayjs, { type Dayjs } from 'dayjs';
import { z } from 'zod';

/** Antecedência mínima de um agendamento (evita horários que viram passado antes de salvar). */
export const MIN_SCHEDULE_AHEAD_MINUTES = 1;
export const MAX_BODY_LENGTH = 1000;
export const MAX_RECIPIENTS = 500;

const dayjsValue = z.custom<Dayjs | null>((value) => value === null || dayjs.isDayjs(value));

export const messageSchema = z
  .object({
    recipientIds: z
      .array(z.string())
      .min(1, 'Selecione pelo menos um contato.')
      .max(MAX_RECIPIENTS, `Máximo de ${MAX_RECIPIENTS} destinatários.`),
    body: z
      .string()
      .trim()
      .min(1, 'Escreva a mensagem.')
      .max(MAX_BODY_LENGTH, `Máximo de ${MAX_BODY_LENGTH} caracteres.`),
    mode: z.enum(['now', 'schedule']),
    scheduledAt: dayjsValue,
  })
  .superRefine(({ mode, scheduledAt }, context) => {
    if (mode !== 'schedule') return;
    if (!scheduledAt || !scheduledAt.isValid()) {
      context.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'Escolha a data e o horário do envio.',
      });
      return;
    }
    if (scheduledAt.isBefore(dayjs().add(MIN_SCHEDULE_AHEAD_MINUTES, 'minute'))) {
      context.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'Escolha um horário pelo menos 1 minuto no futuro.',
      });
    }
  });

export type MessageFormValues = z.infer<typeof messageSchema>;
