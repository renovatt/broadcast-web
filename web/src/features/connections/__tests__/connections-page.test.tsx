import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { ConnectionsPage } from '../pages/connections-page';

describe('ConnectionsPage (provisória)', () => {
  it('mostra o cabeçalho e o estado vazio', () => {
    renderWithProviders(<ConnectionsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Conexões' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nenhuma conexão ainda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova conexão' })).toBeDisabled();
  });
});
