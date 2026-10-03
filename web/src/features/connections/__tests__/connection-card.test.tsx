import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { ConnectionCard } from '../_components/connection-card';
import type { Connection } from '../types/connection';

const connection = {
  id: 'c1',
  tenantId: 'u1',
  name: 'WhatsApp Vendas',
  createdAt: { toDate: () => new Date(2026, 9, 2) },
  updatedAt: { toDate: () => new Date(2026, 9, 2) },
} as unknown as Connection;

const renderCard = () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const result = renderWithProviders(
    <ConnectionCard connection={connection} onEdit={onEdit} onDelete={onDelete} />,
  );
  return { ...result, onEdit, onDelete };
};

describe('ConnectionCard', () => {
  it('mostra o nome e a data de criação', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'WhatsApp Vendas' })).toBeInTheDocument();
    expect(screen.getByText('Criada em 02/10/2026')).toBeInTheDocument();
  });

  it('tem links para contatos e broadcast da conexão', () => {
    renderCard();
    expect(screen.getByRole('link', { name: 'Contatos' })).toHaveAttribute(
      'href',
      '/connections/c1/contacts',
    );
    expect(screen.getByRole('link', { name: 'Broadcast' })).toHaveAttribute(
      'href',
      '/connections/c1/broadcast',
    );
  });

  it('dispara editar e excluir com a conexão', async () => {
    const { user, onEdit, onDelete } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Editar WhatsApp Vendas' }));
    expect(onEdit).toHaveBeenCalledWith(connection);

    await user.click(screen.getByRole('button', { name: 'Excluir WhatsApp Vendas' }));
    expect(onDelete).toHaveBeenCalledWith(connection);
  });
});
