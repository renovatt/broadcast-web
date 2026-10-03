import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RhfTextField } from '../rhf-text-field';

const schema = z.object({ name: z.string().min(1, 'Obrigatório.') });
type Values = z.infer<typeof schema>;

const TestForm = ({ onSubmit }: { onSubmit: (values: Values) => void }) => {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RhfTextField name="name" control={control} label="Nome" helperText="Seu nome" />
      <button type="submit">Salvar</button>
    </form>
  );
};

describe('RhfTextField', () => {
  it('mostra o helperText enquanto não há erro', () => {
    render(<TestForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Seu nome')).toBeInTheDocument();
  });

  it('exibe o erro de validação no lugar do helperText e marca o campo como inválido', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Obrigatório.')).toBeInTheDocument();
    expect(screen.queryByText('Seu nome')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
  });

  it('liga o valor digitado ao formulário', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Nome'), 'Maria');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Maria' }, expect.anything());
  });
});
