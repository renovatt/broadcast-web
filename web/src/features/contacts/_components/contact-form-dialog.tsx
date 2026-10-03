import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { RhfTextField } from '@/components/rhf/rhf-text-field';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { formatPhoneNational } from '@/shared/utils/phone';
import { PHONE_MASK } from '@/shared/utils/phone-mask';
import { withFeedback } from '@/shared/utils/with-feedback';
import { createContact, updateContact } from '../api/contacts-api';
import {
  createContactSchema,
  type ContactFormInput,
  type ContactFormValues,
} from '../schemas/contact-schemas';
import type { Contact } from '../types/contact';

type ContactFormDialogProps = {
  connectionId: string;
  /** Sem contato = criação; com contato = edição. */
  contact?: Contact;
  /** Telefones (E.164) dos outros contatos da conexão, para evitar duplicados. */
  takenPhones: readonly string[];
  onClose: () => void;
};

/** Montado apenas quando aberto (o pai controla), então o formulário sempre começa limpo. */
export const ContactFormDialog = ({
  connectionId,
  contact,
  takenPhones,
  onClose,
}: ContactFormDialogProps) => {
  const { uid } = useCurrentUser();
  const isEditing = Boolean(contact);
  const schema = useMemo(() => createContactSchema(takenPhones), [takenPhones]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contact?.name ?? '',
      phone: contact ? formatPhoneNational(contact.phone) : '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await withFeedback<unknown>(
        () =>
          contact ? updateContact(contact.id, values) : createContact(uid, connectionId, values),
        isEditing ? 'Contato atualizado.' : 'Contato adicionado.',
      );
      onClose();
    } catch {
      // O toast de erro já foi exibido; o diálogo continua aberto com os valores digitados.
    }
  });

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="contact-form-title"
    >
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle id="contact-form-title">
          {isEditing ? 'Editar contato' : 'Novo contato'}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2!">
          <RhfTextField
            name="name"
            control={control}
            label="Nome"
            autoComplete="off"
            autoFocus
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <RhfTextField
            name="phone"
            control={control}
            label="Telefone"
            type="tel"
            autoComplete="off"
            placeholder="(11) 99999-8888"
            helperText="Celular ou fixo, com DDD."
            mask={PHONE_MASK}
          />
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
