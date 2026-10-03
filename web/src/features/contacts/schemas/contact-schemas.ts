import { z } from 'zod';
import { isValidPhone, normalizePhone } from '@/shared/utils/phone';

/**
 * Valida e normaliza o contato. O telefone digitado vira E.164 na saída do schema.
 * `takenPhones`: telefones (E.164) já usados por outros contatos da mesma conexão.
 */
export const createContactSchema = (takenPhones: readonly string[] = []) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome do contato.')
      .max(80, 'Máximo de 80 caracteres.'),
    phone: z
      .string()
      .trim()
      .min(1, 'Informe o telefone.')
      .transform(normalizePhone)
      .refine(isValidPhone, 'Telefone inválido. Use DDD + número, ex.: (11) 99999-8888.')
      .refine(
        (phone) => !takenPhones.includes(phone),
        'Já existe um contato com este telefone nesta conexão.',
      ),
  });

export type ContactFormInput = z.input<ReturnType<typeof createContactSchema>>;
export type ContactFormValues = z.output<ReturnType<typeof createContactSchema>>;
