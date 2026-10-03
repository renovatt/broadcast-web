import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { MessageItem } from '../_components/message-item';
import { scheduledMessage, sentMessage } from './fixtures';

describe('MessageItem', () => {
  it('mensagem enviada: chip, data de envio, texto e destinatários; sem editar', () => {
    renderWithProviders(<MessageItem message={sentMessage} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const item = screen.getByRole('article', { name: 'Mensagem enviada em 03/10/2026 10:12' });
    expect(item).toHaveTextContent('Enviada');
    expect(item).toHaveTextContent('Promoção de outubro');
    expect(item).toHaveTextContent('Para: Ana e Bruno');
    expect(item).toHaveTextContent('2 destinatários');
    expect(screen.queryByRole('button', { name: 'Editar mensagem' })).not.toBeInTheDocument();
  });

  it('mensagem agendada: data de agendamento e resumo de destinatários', async () => {
    const { user } = renderWithProviders(
      <MessageItem message={scheduledMessage} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    const item = screen.getByRole('article', { name: 'Mensagem agendada para 05/10/2030 14:30' });
    expect(item).toHaveTextContent('Agendada');
    expect(item).toHaveTextContent('Para: Ana, Bruno e mais 1');
    expect(item).toHaveTextContent('3 destinatários');

    // A lista completa aparece num tooltip ao passar o mouse sobre os nomes (sem title nativo).
    const names = screen.getByText('Para: Ana, Bruno e mais 1');
    expect(names.closest('header')).not.toHaveAttribute('title');
    await user.hover(names);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Ana, Bruno, Carla');
  });

  it('singular para um destinatário', () => {
    const single = { ...sentMessage, recipients: sentMessage.recipients.slice(0, 1) };
    renderWithProviders(<MessageItem message={single} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('article')).toHaveTextContent('1 destinatário');
  });

  it('enviada: status, data e ícone DoneAll dentro do balão, com tom verde', () => {
    renderWithProviders(<MessageItem message={sentMessage} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const bubble = screen.getByText('Promoção de outubro').parentElement!;

    expect(bubble).toHaveClass('bg-emerald-50');
    expect(within(bubble).getByLabelText('Enviada em 03/10/2026 10:12')).toHaveTextContent(
      'Enviada · 03/10/2026 10:12',
    );
    expect(within(bubble).getByTestId('DoneAllIcon')).toBeInTheDocument();
    expect(within(bubble).queryByTestId('ScheduleIcon')).not.toBeInTheDocument();
  });

  it('agendada: status, data e ícone de relógio dentro do balão, com tom âmbar', () => {
    renderWithProviders(
      <MessageItem message={scheduledMessage} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const bubble = screen.getByText('Lembrete da reunião').parentElement!;

    expect(bubble).toHaveClass('bg-amber-50');
    expect(within(bubble).getByLabelText('Agendada para 05/10/2030 14:30')).toHaveTextContent(
      'Agendada · 05/10/2030 14:30',
    );
    expect(within(bubble).getByTestId('ScheduleIcon')).toBeInTheDocument();
  });

  it('destinatários (avatares) ficam no topo, antes do balão', () => {
    renderWithProviders(<MessageItem message={sentMessage} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const header = screen.getByText('Para: Ana e Bruno').closest('header')!;
    const bubble = screen.getByText('Promoção de outubro').parentElement!;

    expect(within(header).getByText('A')).toBeInTheDocument();
    expect(within(header).getByText('B')).toBeInTheDocument();
    expect(header.compareDocumentPosition(bubble) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('dispara editar (só agendada) e excluir', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { user } = renderWithProviders(
      <MessageItem message={scheduledMessage} onEdit={onEdit} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar mensagem' }));
    expect(onEdit).toHaveBeenCalledWith(scheduledMessage);
    await user.click(screen.getByRole('button', { name: 'Excluir mensagem' }));
    expect(onDelete).toHaveBeenCalledWith(scheduledMessage);
  });
});
