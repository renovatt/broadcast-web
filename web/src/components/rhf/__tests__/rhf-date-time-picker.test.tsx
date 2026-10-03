import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { AppProviders } from '@/app/app-providers';
import { RhfDateTimePicker } from '../rhf-date-time-picker';

const TestForm = ({ value, error }: { value: Dayjs | null; error?: string }) => {
  const { control, setError } = useForm<{ when: Dayjs | null }>({ defaultValues: { when: value } });
  if (error && !control.getFieldState('when').error) setError('when', { message: error });
  return (
    <RhfDateTimePicker name="when" control={control} label="Quando" helperText="Dica de uso" />
  );
};

const renderPicker = (value: Dayjs | null, error?: string) =>
  render(
    <AppProviders>
      <TestForm value={value} error={error} />
    </AppProviders>,
  );

describe('RhfDateTimePicker', () => {
  it('mostra o valor do formulário em 24h (pt-BR) e o texto de ajuda', () => {
    renderPicker(dayjs(new Date(2030, 9, 5, 14, 30)));
    expect(screen.getByRole('group', { name: /Quando/ })).toHaveTextContent('05/10/2030 14:30');
    expect(screen.getByText('Dica de uso')).toBeInTheDocument();
  });

  it('exibe o erro de validação no lugar da ajuda', () => {
    renderPicker(null, 'Escolha a data');
    expect(screen.getByText('Escolha a data')).toBeInTheDocument();
    expect(screen.queryByText('Dica de uso')).not.toBeInTheDocument();
  });
});
