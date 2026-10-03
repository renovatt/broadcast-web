import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
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

describe('ConnectionCard — resumo', () => {
  const summary = () => screen.getByRole('list', { name: 'Resumo da conexão' });

  it('mostra contatos, enviadas e agendadas vindos de stats', () => {
    renderWithProviders(
      <ConnectionCard
        connection={{ ...connection, stats: { contacts: 12, sent: 30, scheduled: 4 } }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const items = within(summary()).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      '12 contatos',
      '30 enviadas',
      '4 agendadas',
    ]);
  });

  it('usa singular quando o número é 1', () => {
    renderWithProviders(
      <ConnectionCard
        connection={{ ...connection, stats: { contacts: 1, sent: 1, scheduled: 1 } }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(summary()).toHaveTextContent('1 contato1 enviada1 agendada');
  });

  it('sem stats (conexão nova) mostra tudo zerado', () => {
    renderCard();
    expect(summary()).toHaveTextContent('0 contatos0 enviadas0 agendadas');
  });
});
