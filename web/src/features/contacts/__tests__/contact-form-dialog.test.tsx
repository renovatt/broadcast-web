import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { DocumentReference } from 'firebase/firestore';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { createContact, updateContact } from '../api/contacts-api';
import { ContactFormDialog } from '../_components/contact-form-dialog';
import type { Contact } from '../types/contact';

vi.mock('../api/contacts-api', () => ({ createContact: vi.fn(), updateContact: vi.fn() }));

const existing = { id: 'k1', name: 'Maria', phone: '+5511999998888' } as Contact;

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
});

const renderDialog = (props: Partial<Parameters<typeof ContactFormDialog>[0]> = {}) => {
  const onClose = vi.fn();
  const result = renderWithProviders(
    <ContactFormDialog connectionId="c1" takenPhones={[]} onClose={onClose} {...props} />,
  );
  return { ...result, onClose };
};

describe('ContactFormDialog — criação', () => {
  it('valida campos obrigatórios', async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByText('Informe o nome do contato.')).toBeInTheDocument();
    expect(screen.getByText('Informe o telefone.')).toBeInTheDocument();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('valida telefone inválido', async () => {
    const { user } = renderDialog();
    await user.type(screen.getByLabelText('Nome'), 'Maria');
    await user.type(screen.getByLabelText('Telefone'), '9999-8888');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText('Telefone inválido. Use DDD + número, ex.: (11) 99999-8888.'),
    ).toBeInTheDocument();
  });

  it('impede telefone duplicado na conexão', async () => {
    const { user } = renderDialog({ takenPhones: ['+5511999998888'] });
    await user.type(screen.getByLabelText('Nome'), 'Outra');
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-8888');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText('Já existe um contato com este telefone nesta conexão.'),
    ).toBeInTheDocument();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('cria o contato com telefone normalizado, notifica e fecha', async () => {
    vi.mocked(createContact).mockResolvedValue({} as DocumentReference);
    const { user, onClose } = renderDialog();

    await user.type(screen.getByLabelText('Nome'), 'Maria');
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-8888');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(createContact).toHaveBeenCalledWith('u1', 'c1', {
      name: 'Maria',
      phone: '+5511999998888',
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useNotificationStore.getState().notification?.message).toBe('Contato adicionado.');
  });

  it('notifica erro e mantém aberto quando falha', async () => {
    vi.mocked(createContact).mockRejectedValue(new FirebaseError('permission-denied', 'x'));
    const { user, onClose } = renderDialog();

    await user.type(screen.getByLabelText('Nome'), 'Maria');
    await user.type(screen.getByLabelText('Telefone'), '11999998888');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(useNotificationStore.getState().notification?.severity).toBe('error'),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ContactFormDialog — máscara de telefone', () => {
  it('formata enquanto digita e envia em E.164', async () => {
    vi.mocked(createContact).mockResolvedValue({} as DocumentReference);
    const { user } = renderDialog();

    await user.type(screen.getByLabelText('Nome'), 'Fixo');
    await user.type(screen.getByLabelText('Telefone'), '1133334444');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 3333-4444');

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(createContact).toHaveBeenCalledWith('u1', 'c1', {
      name: 'Fixo',
      phone: '+551133334444',
    });
  });

  it('ignora letras e símbolos digitados', async () => {
    const { user } = renderDialog();
    await user.type(screen.getByLabelText('Telefone'), 'ab+11x999998888');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 99999-8888');
  });
});

describe('ContactFormDialog — edição', () => {
  it('preenche com os dados atuais (telefone no formato da máscara) e salva', async () => {
    vi.mocked(updateContact).mockResolvedValue();
    const { user, onClose } = renderDialog({ contact: existing });

    expect(screen.getByRole('dialog', { name: 'Editar contato' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Maria');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 99999-8888');

    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'Maria Silva');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateContact).toHaveBeenCalledWith('k1', {
      name: 'Maria Silva',
      phone: '+5511999998888',
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useNotificationStore.getState().notification?.message).toBe('Contato atualizado.');
  });
});
