import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Contact } from '@/features/contacts/types/contact';
import { RecipientPicker } from '../_components/recipient-picker';
import { contacts } from './fixtures';

const Harness = ({
  list = contacts,
  initial = [],
  onChange = vi.fn(),
  error,
}: {
  list?: Contact[];
  initial?: string[];
  onChange?: (ids: string[]) => void;
  error?: string;
}) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <RecipientPicker
      contacts={list}
      value={value}
      error={error}
      onChange={(ids) => {
        setValue(ids);
        onChange(ids);
      }}
    />
  );
};

const many = Array.from({ length: 8 }, (_, index) => ({
  id: `p${index}`,
  name: index % 2 ? `Ana ${index}` : `Bruno ${index}`,
  phone: `+55119111100${String(index).padStart(2, '0')}`,
})) as Contact[];

describe('RecipientPicker', () => {
  it('lista os contatos com telefone formatado e conta os selecionados', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('group', { name: 'Destinatários' })).toBeInTheDocument();
    expect(screen.getByText('+55 11 91111-0001')).toBeInTheDocument();
    expect(screen.getByText('0 selecionados')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
    expect(screen.getByText('1 selecionado')).toBeInTheDocument();
  });

  it('marca e desmarca individualmente', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} initial={['k1']} />);

    await user.click(screen.getByRole('checkbox', { name: /Bruno/ }));
    expect(onChange).toHaveBeenLastCalledWith(['k1', 'k2']);
    await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
    expect(onChange).toHaveBeenLastCalledWith(['k2']);
  });

  it('"Selecionar todos" fica indeterminado em seleção parcial e alterna todos', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} initial={['k1']} />);
    const all = screen.getByRole('checkbox', { name: 'Selecionar todos' });

    expect(all).toHaveAttribute('data-indeterminate', 'true');
    await user.click(all);
    expect(onChange).toHaveBeenLastCalledWith(['k1', 'k2', 'k3']);
    expect(all).toBeChecked();

    await user.click(all);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('com muitos contatos, mostra a busca e "selecionar resultados" age só nos filtrados', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness list={many} onChange={onChange} />);

    await user.type(screen.getByRole('textbox', { name: 'Buscar destinatários' }), 'ana');
    expect(screen.getAllByRole('checkbox')).toHaveLength(1 + 4);

    await user.click(screen.getByRole('checkbox', { name: 'Selecionar resultados' }));
    expect(onChange).toHaveBeenLastCalledWith(['p1', 'p3', 'p5', 'p7']);
  });

  it('sem busca para listas curtas', () => {
    render(<Harness />);
    expect(screen.queryByRole('textbox', { name: 'Buscar destinatários' })).not.toBeInTheDocument();
  });

  it('mostra o erro de validação', () => {
    render(<Harness error="Selecione pelo menos um contato." />);
    expect(screen.getByText('Selecione pelo menos um contato.')).toBeInTheDocument();
  });
});
