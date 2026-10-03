import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { renderWithProviders } from '@test-utils/render';
import { MessageHistory } from '../_components/message-history';
import type { MessageFilter } from '../utils/message-filters';
import { scheduledMessage, sentMessage } from './fixtures';

const renderHistory = (props: Partial<Parameters<typeof MessageHistory>[0]> = {}) => {
  const onFilterChange = vi.fn();
  const result = renderWithProviders(
    <MessageHistory
      messages={[sentMessage, scheduledMessage]}
      loading={false}
      error={undefined}
      filter="all"
      onFilterChange={onFilterChange}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...props}
    />,
  );
  return { ...result, onFilterChange };
};

describe('MessageHistory', () => {
  it('mostra carregamento e erro', () => {
    const { unmount } = renderHistory({ messages: undefined, loading: true });
    expect(screen.getByLabelText('Carregando mensagens')).toBeInTheDocument();
    unmount();

    renderHistory({ error: new FirebaseError('failed-precondition', 'x') });
    expect(screen.getByRole('alert')).toHaveTextContent('índice em criação');
  });

  it('estado vazio sem mensagens', () => {
    renderHistory({ messages: [] });
    expect(screen.getByRole('heading', { name: 'Nenhuma mensagem ainda' })).toBeInTheDocument();
  });

  it('lista as mensagens e mostra os contadores no filtro', () => {
    renderHistory();
    const filter = screen.getByRole('group', { name: 'Filtrar mensagens' });
    expect(within(filter).getByRole('button', { name: 'Todas (2)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(filter).getByRole('button', { name: 'Enviadas (1)' })).toBeInTheDocument();
    expect(within(filter).getByRole('button', { name: 'Agendadas (1)' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Mensagens' })).getAllByRole('article'),
    ).toHaveLength(2);
  });

  it.each([
    ['sent', 'Enviada'],
    ['scheduled', 'Agendada'],
  ] as [MessageFilter, string][])(
    'filtro %s mostra só as mensagens daquele status',
    (filter, label) => {
      renderHistory({ filter });
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent(label);
    },
  );

  it('avisa quando o filtro não tem resultados', () => {
    renderHistory({ messages: [sentMessage], filter: 'scheduled' });
    expect(screen.getByText('Nenhuma mensagem agendada.')).toBeInTheDocument();
  });

  it('troca de filtro e ignora clique no filtro ativo', async () => {
    const { user, onFilterChange } = renderHistory();
    await user.click(screen.getByRole('button', { name: 'Agendadas (1)' }));
    expect(onFilterChange).toHaveBeenCalledWith('scheduled');

    onFilterChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Todas (2)' }));
    expect(onFilterChange).not.toHaveBeenCalled();
  });
});
