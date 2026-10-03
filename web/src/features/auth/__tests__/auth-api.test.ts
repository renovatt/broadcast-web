import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  getAuthErrorMessage,
  isAuthCancellation,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  subscribeToAuthChanges,
} from '../api/auth-api';

vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/auth')>()),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

const fakeUser = { uid: 'u1' } as firebaseAuth.User;

beforeEach(() => {
  vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue({
    user: fakeUser,
  } as firebaseAuth.UserCredential);
});

describe('signIn', () => {
  it('faz login com e-mail sem espaços extras', async () => {
    await signIn({ email: ' joao@teste.com ', password: 'segredo' });
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'joao@teste.com',
      'segredo',
    );
  });
});

describe('signUp', () => {
  it('cria a conta e grava o nome no perfil', async () => {
    const user = await signUp({
      name: ' João ',
      email: ' joao@teste.com',
      password: 'segredo123',
      confirmPassword: 'segredo123',
    });

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'joao@teste.com',
      'segredo123',
    );
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: 'João' });
    expect(user).toBe(fakeUser);
  });
});

describe('signInWithGoogle', () => {
  it('abre o popup do Google pedindo para escolher a conta', async () => {
    await signInWithGoogle();

    const [calledAuth, provider] = vi.mocked(firebaseAuth.signInWithPopup).mock.calls[0];
    expect(calledAuth).toBe(auth);
    expect(provider).toBeInstanceOf(firebaseAuth.GoogleAuthProvider);
    expect((provider as firebaseAuth.GoogleAuthProvider).getCustomParameters()).toEqual({
      prompt: 'select_account',
    });
  });
});

describe('signOut', () => {
  it('encerra a sessão', async () => {
    await signOut();
    expect(firebaseAuth.signOut).toHaveBeenCalledWith(auth);
  });
});

describe('subscribeToAuthChanges', () => {
  it('repassa o callback e devolve a função de cancelamento', () => {
    const unsubscribe = vi.fn();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockReturnValue(unsubscribe);
    const callback = vi.fn();

    expect(subscribeToAuthChanges(callback)).toBe(unsubscribe);
    expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalledWith(auth, callback);
  });
});

describe('getAuthErrorMessage', () => {
  it.each([
    ['auth/invalid-credential', 'E-mail ou senha incorretos.'],
    ['auth/wrong-password', 'E-mail ou senha incorretos.'],
    ['auth/user-not-found', 'E-mail ou senha incorretos.'],
    ['auth/email-already-in-use', 'Já existe uma conta com este e-mail.'],
    [
      'auth/popup-blocked',
      'O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.',
    ],
  ])('traduz %s', (code, message) => {
    expect(getAuthErrorMessage(new FirebaseError(code, 'x'))).toBe(message);
  });

  it('usa mensagem genérica para códigos desconhecidos e erros comuns', () => {
    const generic = 'Não foi possível concluir. Tente novamente.';
    expect(getAuthErrorMessage(new FirebaseError('auth/unknown', 'x'))).toBe(generic);
    expect(getAuthErrorMessage(new Error('boom'))).toBe(generic);
  });
});

describe('isAuthCancellation', () => {
  it('reconhece popup fechado/cancelado pelo usuário', () => {
    expect(isAuthCancellation(new FirebaseError('auth/popup-closed-by-user', 'x'))).toBe(true);
    expect(isAuthCancellation(new FirebaseError('auth/cancelled-popup-request', 'x'))).toBe(true);
  });

  it('não trata outros erros como cancelamento', () => {
    expect(isAuthCancellation(new FirebaseError('auth/popup-blocked', 'x'))).toBe(false);
    expect(isAuthCancellation(new Error('auth/popup-closed-by-user'))).toBe(false);
  });
});
