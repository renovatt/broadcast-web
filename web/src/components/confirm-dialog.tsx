import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Ação destrutiva (ex.: excluir): botão vermelho. */
  destructive?: boolean;
  /** Pode ser assíncrona: o diálogo mostra carregamento e só fecha se ela concluir. */
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Quem chama é responsável por notificar o erro; o diálogo permanece aberto.
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onClose} disabled={pending} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          loading={pending}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
