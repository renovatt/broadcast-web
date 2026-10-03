import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { renderWithProviders } from '@test-utils/render';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { Connection } from '@/features/connections/types/connection';
import { useNotificationStore } from '@/shared/stores/notification-store';
import { deleteContact } from '../api/contacts-api';
import { useContacts } from '../hooks/use-contacts';
import { ContactsPage } from '../pages/contacts-page';
import type { Contact } from '../types/contact';

vi.mock('@/features/connections/hooks/use-connection', () => ({
  useCurrentConnection: () => ({ id: 'c1', name: 'Vendas' }) as Connection,
}));
vi.mock('../hooks/use-contacts', () => ({ useContacts: vi.fn() }));
vi.mock('../api/contacts-api', () => ({
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

const contacts = [
  { id: 'k1', name: 'Ana', phone: '+5511999998888' },
  { id: 'k2', name: 'Bruno', phone: '+5521988887777' },
] as Contact[];

const mockState = (state: Partial<ReturnType<typeof useContacts>>) =>
  vi.mocked(useContacts).mockReturnValue({
    data: undefined,
    error: undefined,
    loading: false,
    ...state,
  });

beforeEach(() => {
  useAuthStore.getState().setUser({ uid: 'u1', email: 'a@a.com', displayName: 'A' });
  useNotificationStore.getState().dismiss();
});

describe('ContactsPage', () => {
  it('busca os contatos da conexão atual e mostra carregamento', () => {
    mockState({ loading: true });
    renderWithProviders(<ContactsPage />);
    expect(useContacts).toHaveBeenCalledWith('c1');
    expect(screen.getByLabelText('Carregando contatos')).toBeInTheDocument();
  });

  it('mostra erro da consulta', () => {
    mockState({ error: new FirebaseError('permission-denied', 'x') });
    renderWithProviders(<ContactsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Você não tem permissão');
  });

  it('estado vazio com atalho para adicionar', async () => {
    mockState({ data: [] });
    const { user } = renderWithProviders(<ContactsPage />);

    expect(
      screen.getByRole('heading', { name: 'Nenhum contato nesta conexão' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Adicionar contato' }));
    expect(screen.getByRole('dialog', { name: 'Novo contato' })).toBeInTheDocument();
  });

  it('lista os contatos com a contagem', () => {
    mockState({ data: contacts });
    renderWithProviders(<ContactsPage />);
    expect(screen.getByText('2 contatos')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Ana')).toBeInTheDocument();
  });

  it('filtra pela busca e informa quando nada corresponde', async () => {
    mockState({ data: contacts });
    const { user } = renderWithProviders(<ContactsPage />);
    const search = screen.getByRole('textbox', { name: 'Buscar contatos' });

    await user.type(search, 'bru');
    expect(screen.getByText('1 de 2 contatos')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText('Ana')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'xyz');
    expect(screen.getByText('Nenhum contato encontrado para “xyz”.')).toBeInTheDocument();
  });

  it('na edição, o próprio telefone não conta como duplicado', async () => {
    mockState({ data: contacts });
    const { user } = renderWithProviders(<ContactsPage />);

    await user.click(screen.getByRole('button', { name: 'Editar Ana' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      screen.queryByText('Já existe um contato com este telefone nesta conexão.'),
    ).not.toBeInTheDocument();
  });

  it('na criação, telefone de outro contato é bloqueado', async () => {
    mockState({ data: contacts });
    const { user } = renderWithProviders(<ContactsPage />);

    await user.click(screen.getByRole('button', { name: 'Novo contato' }));
    await user.type(screen.getByLabelText('Nome'), 'Clone');
    await user.type(screen.getByLabelText('Telefone'), '(21) 98888-7777');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText('Já existe um contato com este telefone nesta conexão.'),
    ).toBeInTheDocument();
  });

  it('exclui após confirmação', async () => {
    mockState({ data: contacts });
    vi.mocked(deleteContact).mockResolvedValue();
    const { user } = renderWithProviders(<ContactsPage />);

    await user.click(screen.getByRole('button', { name: 'Excluir Bruno' }));
    const dialog = screen.getByRole('dialog', { name: 'Excluir "Bruno"?' });
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(deleteContact).toHaveBeenCalledWith('k2');
    await waitFor(() =>
      expect(useNotificationStore.getState().notification?.message).toBe('Contato excluído.'),
    );
  });
});
