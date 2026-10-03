import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { RhfTextField } from '../rhf-text-field';

const TestForm = ({ onSubmit }: { onSubmit: (values: { code: string }) => void }) => {
  const { control, handleSubmit } = useForm({ defaultValues: { code: '' } });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RhfTextField
        name="code"
        control={control}
        label="Código"
        mask={{ mask: '___-___', replacement: { _: /\d/ } }}
        slotProps={{ htmlInput: { 'data-testid': 'code-input' } }}
      />
      <button type="submit">Enviar</button>
    </form>
  );
};

describe('RhfTextField com mask', () => {
  it('aplica a máscara ao digitar e envia o valor mascarado ao formulário', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Código'), '12a3456');
    expect(screen.getByLabelText('Código')).toHaveValue('123-456');

    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledWith({ code: '123-456' }, expect.anything());
  });

  it('preserva os slotProps.htmlInput recebidos', () => {
    render(<TestForm onSubmit={vi.fn()} />);
    expect(screen.getByTestId('code-input')).toBe(screen.getByLabelText('Código'));
  });
});

describe('RhfTextField com mask — desmontagem', () => {
  it('desmontar com o campo focado encerra o loop de timers da máscara (sem vazamento)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TestForm onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('Código'), '123');
    expect(screen.getByLabelText('Código')).toHaveFocus();

    // Enquanto focado, a biblioteca agenda setTimeout(…) sem atraso continuamente.
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    unmount();
    setTimeoutSpy.mockClear();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const zeroDelayCalls = setTimeoutSpy.mock.calls.filter(([, delay]) => !delay);
    expect(zeroDelayCalls).toHaveLength(0);
  });
});
