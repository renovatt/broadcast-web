import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { PageHeader } from '../page-header';

describe('PageHeader', () => {
  it('renderiza título, subtítulo e ações', () => {
    renderWithProviders(
      <PageHeader
        title="Conexões"
        subtitle="Gerencie suas conexões"
        actions={<button type="button">Nova</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Conexões' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie suas conexões')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova' })).toBeInTheDocument();
  });

  it('mostra o link de volta quando informado', () => {
    renderWithProviders(
      <PageHeader title="Vendas" back={{ label: 'Conexões', to: '/connections' }} />,
    );
    expect(screen.getByRole('link', { name: 'Conexões' })).toHaveAttribute('href', '/connections');
  });

  it('sem link de volta por padrão', () => {
    renderWithProviders(<PageHeader title="Vendas" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
