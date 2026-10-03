import { describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import type { UserCredential } from 'firebase/auth';
import { renderWithProviders } from '@test-utils/render';
import { signInWithGoogle } from '../api/auth-api';
import { GoogleSignInButton } from '../_components/google-sign-in-button';

vi.mock('../api/auth-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/auth-api')>()),
  signInWithGoogle: vi.fn(),
}));

const button = () => screen.getByRole('button', { name: /continuar com google/i });

describe('GoogleSignInButton', () => {
  it('inicia o login com Google e limpa erros anteriores', async () => {
    vi.mocked(signInWithGoogle).mockResolvedValue({} as UserCredential);
    const onError = vi.fn();
    const { user } = renderWithProviders(<GoogleSignInButton onError={onError} />);

    await user.click(button());

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(null);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('informa o erro traduzido quando o login falha', async () => {
    vi.mocked(signInWithGoogle).mockRejectedValue(new FirebaseError('auth/popup-blocked', 'x'));
    const onError = vi.fn();
    const { user } = renderWithProviders(<GoogleSignInButton onError={onError} />);

    await user.click(button());

    expect(onError).toHaveBeenLastCalledWith(
      'O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.',
    );
  });

  it('não mostra erro quando o usuário fecha o popup', async () => {
    vi.mocked(signInWithGoogle).mockRejectedValue(
      new FirebaseError('auth/popup-closed-by-user', 'x'),
    );
    const onError = vi.fn();
    const { user } = renderWithProviders(<GoogleSignInButton onError={onError} />);

    await user.click(button());

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(null);
  });

  it('libera o botão quando a janela recupera o foco (popup fechado)', async () => {
    vi.mocked(signInWithGoogle).mockReturnValue(new Promise(() => undefined));
    const { user } = renderWithProviders(<GoogleSignInButton onError={vi.fn()} />);

    await user.click(button());
    await waitFor(() => expect(button()).toBeDisabled());

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await waitFor(() => expect(button()).toBeEnabled());
  });

  it('respeita a prop disabled', () => {
    renderWithProviders(<GoogleSignInButton disabled onError={vi.fn()} />);
    expect(button()).toBeDisabled();
  });
});
