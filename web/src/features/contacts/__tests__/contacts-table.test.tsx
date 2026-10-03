import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { ContactsTable } from '../_components/contacts-table';
import type { Contact } from '../types/contact';

const contacts = [
  { id: 'k1', name: 'Maria', phone: '+5511999998888' },
  { id: 'k2', name: 'John', phone: '+14155552671' },
] as Contact[];

describe('ContactsTable', () => {
  it('lista nome e telefone formatado', () => {
    renderWithProviders(<ContactsTable contacts={contacts} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const rows = within(screen.getByRole('table', { name: 'Contatos' })).getAllByRole('row');
    expect(rows).toHaveLength(3); // cabeçalho + 2
    expect(rows[1]).toHaveTextContent('Maria');
    expect(rows[1]).toHaveTextContent('+55 11 99999-8888');
    expect(rows[2]).toHaveTextContent('+14155552671');
  });

  it('dispara editar e excluir com o contato da linha', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { user } = renderWithProviders(
      <ContactsTable contacts={contacts} onEdit={onEdit} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar John' }));
    expect(onEdit).toHaveBeenCalledWith(contacts[1]);

    await user.click(screen.getByRole('button', { name: 'Excluir Maria' }));
    expect(onDelete).toHaveBeenCalledWith(contacts[0]);
  });
});
