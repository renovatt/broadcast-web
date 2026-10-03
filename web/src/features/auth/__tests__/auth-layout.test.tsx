import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { AuthLayout } from '../_components/auth-layout';

describe('AuthLayout', () => {
  it('renderiza título, subtítulo, conteúdo e rodapé', () => {
    renderWithProviders(
      <AuthLayout title="Entrar" subtitle="Bem-vindo" footer={<span>rodapé</span>}>
        <p>conteúdo</p>
      </AuthLayout>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(screen.getByText('rodapé')).toBeInTheDocument();
  });
});
