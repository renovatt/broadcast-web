import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Connection } from '@/features/connections/types/connection';
import { BroadcastPage } from '../pages/broadcast-page';

vi.mock('@/features/connections/hooks/use-connection', () => ({
  useCurrentConnection: () => ({ id: 'c1', name: 'Vendas' }) as Connection,
}));

describe('BroadcastPage (provisória)', () => {
  it('mostra a conexão atual', () => {
    render(<BroadcastPage />);
    expect(
      screen.getByText('O envio de mensagens para os contatos de "Vendas" aparecerá aqui.'),
    ).toBeInTheDocument();
  });
});
