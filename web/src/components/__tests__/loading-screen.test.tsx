import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../loading-screen';

describe('LoadingScreen', () => {
  it('exibe um indicador de carregamento acessível', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
  });
});
