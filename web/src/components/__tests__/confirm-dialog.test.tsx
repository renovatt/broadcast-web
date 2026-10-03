import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../confirm-dialog';

const renderDialog = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Excluir conexão?"
      description="Contatos e mensagens também serão removidos."
      confirmLabel="Excluir"
      destructive
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onClose, onConfirm, user: userEvent.setup() };
};

describe('ConfirmDialog', () => {
  it('mostra título e descrição acessíveis', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog', { name: 'Excluir conexão?' });
    expect(dialog).toHaveAccessibleDescription('Contatos e mensagens também serão removidos.');
  });

  it('cancelar apenas fecha', async () => {
    const { user, onClose, onConfirm } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirma e fecha após a ação concluir', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { user, onClose } = renderDialog({ onConfirm });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('desabilita os botões enquanto a ação está pendente', async () => {
    let finish: () => void = () => undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { user, onClose } = renderDialog({ onConfirm });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();

    finish();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('permanece aberto se a ação falhar', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('falhou'));
    const { user, onClose } = renderDialog({ onConfirm });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Excluir' })).toBeEnabled());
    expect(onClose).not.toHaveBeenCalled();
  });
});
