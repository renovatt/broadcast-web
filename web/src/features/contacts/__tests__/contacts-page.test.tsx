import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Connection } from '@/features/connections/types/connection';
import { ContactsPage } from '../pages/contacts-page';

vi.mock('@/features/connections/hooks/use-connection', () => ({
  useCurrentConnection: () => ({ id: 'c1', name: 'Vendas' }) as Connection,
}));

describe('ContactsPage (provisória)', () => {
  it('mostra a conexão atual', () => {
    render(<ContactsPage />);
    expect(screen.getByText('Os contatos de "Vendas" aparecerão aqui.')).toBeInTheDocument();
  });
});
