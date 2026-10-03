import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { renderWithProviders } from '@test-utils/render';
import { MessageForm } from '../_components/message-form';
import { contacts } from './fixtures';

const renderForm = (props: Partial<Parameters<typeof MessageForm>[0]> = {}) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const result = renderWithProviders(
    <MessageForm
      contacts={contacts}
      onSubmit={onSubmit}
      renderActions={({ mode, isSubmitting }) => (
        <button type="submit" disabled={isSubmitting}>
          {mode === 'now' ? 'Enviar' : 'Agendar'}
        </button>
      )}
      {...props}
    />,
  );
  return { ...result, onSubmit };
};

describe('MessageForm', () => {
  it('valida destinatários e texto', async () => {
    const { user, onSubmit } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Selecione pelo menos um contato.')).toBeInTheDocument();
    expect(screen.getByText('Escreva a mensagem.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mostra o contador de caracteres', async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText('Mensagem'), 'Olá');
    expect(screen.getByText('3/1000')).toBeInTheDocument();
  });

  it('envio imediato entrega o input pronto para a API e limpa quando pedido', async () => {
    const { user, onSubmit } = renderForm({ resetOnSuccess: true });

    await user.click(screen.getByRole('checkbox', { name: /Carla/ }));
    await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
    await user.type(screen.getByLabelText('Mensagem'), '  Promoção  ');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        mode: 'now',
        body: 'Promoção',
        recipients: [
          { id: 'k1', name: 'Ana', phone: '+5511911110001' },
          { id: 'k3', name: 'Carla', phone: '+5511911110003' },
        ],
      }),
    );
    await waitFor(() => expect(screen.getByLabelText('Mensagem')).toHaveValue(''));
    expect(screen.getByText('0 selecionados')).toBeInTheDocument();
  });

  it('mantém os valores quando o envio falha', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'));
    const { user } = renderForm({ onSubmit, resetOnSuccess: true });

    await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
    await user.type(screen.getByLabelText('Mensagem'), 'Oi');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Oi');
  });

  it('agendar mostra o campo de data e exige preenchimento', async () => {
    const { user, onSubmit } = renderForm();

    expect(screen.queryByRole('group', { name: /Data e horário/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Agendar' }));
    expect(screen.getByRole('group', { name: /Data e horário do envio/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Ana/ }));
    await user.type(screen.getByLabelText('Mensagem'), 'Oi');
    await user.click(screen.getByRole('button', { name: 'Agendar' }));

    expect(await screen.findByText('Escolha a data e o horário do envio.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('agendamento entrega a data escolhida como Date', async () => {
    const scheduledAt = dayjs().add(2, 'day').second(0).millisecond(0);
    const { user, onSubmit } = renderForm({
      defaultValues: { recipientIds: ['k2'], body: 'Lembrete', mode: 'schedule', scheduledAt },
    });

    await user.click(screen.getByRole('button', { name: 'Agendar' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        mode: 'schedule',
        scheduledAt: scheduledAt.toDate(),
        body: 'Lembrete',
        recipients: [{ id: 'k2', name: 'Bruno', phone: '+5511911110002' }],
      }),
    );
  });

  it('bloqueia quando os selecionados não existem mais', async () => {
    const { user, onSubmit } = renderForm({
      defaultValues: { recipientIds: ['apagado'], body: 'Oi' },
    });
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Os contatos selecionados não existem mais.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
