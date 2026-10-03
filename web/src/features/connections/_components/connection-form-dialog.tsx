import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { RhfTextField } from '@/components/rhf/rhf-text-field';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { withFeedback } from '@/shared/utils/with-feedback';
import { createConnection, updateConnection } from '../api/connections-api';
import { connectionSchema, type ConnectionFormValues } from '../schemas/connection-schemas';
import type { Connection } from '../types/connection';

type ConnectionFormDialogProps = {
  /** Sem conexão = criação; com conexão = edição. */
  connection?: Connection;
  onClose: () => void;
};

/** Montado apenas quando aberto (o pai controla), então o formulário sempre começa limpo. */
export const ConnectionFormDialog = ({ connection, onClose }: ConnectionFormDialogProps) => {
  const { uid } = useCurrentUser();
  const isEditing = Boolean(connection);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: { name: connection?.name ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await withFeedback<unknown>(
        () =>
          connection ? updateConnection(connection.id, values) : createConnection(uid, values),
        isEditing ? 'Conexão atualizada.' : 'Conexão criada.',
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
      aria-labelledby="connection-form-title"
    >
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle id="connection-form-title">
          {isEditing ? 'Editar conexão' : 'Nova conexão'}
        </DialogTitle>
        <DialogContent className="pt-2!">
          <RhfTextField
            name="name"
            control={control}
            label="Nome da conexão"
            placeholder="Ex.: WhatsApp Vendas"
            autoFocus
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
