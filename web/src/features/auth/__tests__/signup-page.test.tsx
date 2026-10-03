import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { renderWithProviders } from '@test-utils/render';
import { signUp } from '../api/auth-api';
import { SignupPage } from '../pages/signup-page';
import { useAuthStore } from '../stores/auth-store';

vi.mock('../api/auth-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/auth-api')>()),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

const initialState = useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

const fill = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  values: { name: string; email: string; password: string; confirmPassword: string },
) => {
  await user.type(screen.getByLabelText('Nome'), values.name);
  await user.type(screen.getByLabelText('E-mail'), values.email);
  await user.type(screen.getByLabelText('Senha'), values.password);
  await user.type(screen.getByLabelText('Confirmar senha'), values.confirmPassword);
  await user.click(screen.getByRole('button', { name: 'Criar conta' }));
};

const values = {
  name: 'João Teste',
  email: 'joao@teste.com',
  password: 'segredo123',
  confirmPassword: 'segredo123',
};

describe('SignupPage', () => {
  it('valida senhas diferentes sem chamar o Firebase', async () => {
    const { user } = renderWithProviders(<SignupPage />);
    await fill(user, { ...values, confirmPassword: 'outra123' });

    expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('cria a conta e atualiza o store com o nome', async () => {
    vi.mocked(signUp).mockResolvedValue({
      uid: 'u1',
      email: values.email,
      displayName: values.name,
    } as User);
    const { user } = renderWithProviders(<SignupPage />);
    await fill(user, values);

    expect(signUp).toHaveBeenCalledWith(values);
    await waitFor(() =>
      expect(useAuthStore.getState().user).toEqual({
        uid: 'u1',
        email: values.email,
        displayName: values.name,
      }),
    );
  });

  it('mostra o erro traduzido quando o e-mail já existe', async () => {
    vi.mocked(signUp).mockRejectedValue(new FirebaseError('auth/email-already-in-use', 'x'));
    const { user } = renderWithProviders(<SignupPage />);
    await fill(user, values);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma conta com este e-mail.',
    );
    expect(useAuthStore.getState().user).toBeNull();
  });
});
