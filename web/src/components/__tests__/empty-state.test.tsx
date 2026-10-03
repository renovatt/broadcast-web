import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renderiza título, descrição e ação', () => {
    render(
      <EmptyState
        icon={<svg data-testid="icon" />}
        title="Nada por aqui"
        description="Crie o primeiro item."
        action={<button type="button">Criar</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Nada por aqui' })).toBeInTheDocument();
    expect(screen.getByText('Crie o primeiro item.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('descrição e ação são opcionais', () => {
    render(<EmptyState icon={<svg />} title="Vazio" />);
    expect(screen.getByRole('heading', { name: 'Vazio' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
