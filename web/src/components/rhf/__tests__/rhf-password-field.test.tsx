import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { RhfPasswordField } from '../rhf-password-field';

const TestForm = () => {
  const { control } = useForm({ defaultValues: { password: '' } });
  return (
    <RhfPasswordField
      name="password"
      control={control}
      label="Senha"
      autoComplete="current-password"
    />
  );
};

describe('RhfPasswordField', () => {
  it('começa ocultando a senha e alterna a visibilidade pelo botão', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText('Senha');

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
