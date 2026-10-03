import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { UserCredential } from 'firebase/auth';
import { renderWithProviders } from '@test-utils/render';
import { signIn } from '../api/auth-api';
import { LoginPage } from '../pages/login-page';

vi.mock('../api/auth-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/auth-api')>()),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

const fillAndSubmit = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  email: string,
  password: string,
) => {
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
};

describe('LoginPage', () => {
  it('mostra os erros de validação sem chamar o Firebase', async () => {
    const { user } = renderWithProviders(<LoginPage />);
    await fillAndSubmit(user, '', '');

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('envia e-mail e senha', async () => {
    vi.mocked(signIn).mockResolvedValue({} as UserCredential);
    const { user } = renderWithProviders(<LoginPage />);
    await fillAndSubmit(user, 'joao@teste.com', 'segredo123');

    expect(signIn).toHaveBeenCalledWith({ email: 'joao@teste.com', password: 'segredo123' });
  });

  it('mostra o erro traduzido quando as credenciais são inválidas', async () => {
    vi.mocked(signIn).mockRejectedValue(new FirebaseError('auth/invalid-credential', 'x'));
    const { user } = renderWithProviders(<LoginPage />);
    await fillAndSubmit(user, 'joao@teste.com', 'errada');

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  });

  it('oferece login com Google e link para cadastro', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute('href', '/signup');
  });
});
