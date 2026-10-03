import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import type { LoginValues, SignupValues } from '../schemas/auth-schemas';

export const signIn = ({ email, password }: LoginValues) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const signUp = async ({ name, email, password }: SignupValues) => {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  return user;
};

/** Login e cadastro com Google: o primeiro acesso cria a conta (o cliente) automaticamente. */
export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
};

export const signOut = () => firebaseSignOut(auth);

/** Observa login/logout. Retorna a função para cancelar a inscrição. */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

const INVALID_CREDENTIALS = 'E-mail ou senha incorretos.';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Com a proteção contra enumeração de e-mails o Firebase só retorna invalid-credential;
  // sem ela (e no emulador) retorna wrong-password / user-not-found.
  'auth/invalid-credential': INVALID_CREDENTIALS,
  'auth/wrong-password': INVALID_CREDENTIALS,
  'auth/user-not-found': INVALID_CREDENTIALS,
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/operation-not-allowed': 'Este método de login não está habilitado no Firebase.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.',
  'auth/account-exists-with-different-credential':
    'Este e-mail já está cadastrado com outro método de login.',
  'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase Authentication.',
};

/** O usuário fechou/cancelou a janela do Google: não é um erro a exibir. */
export const isAuthCancellation = (error: unknown) =>
  error instanceof FirebaseError &&
  ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(
    error.code,
  );

export const getAuthErrorMessage = (error: unknown) =>
  (error instanceof FirebaseError && AUTH_ERROR_MESSAGES[error.code]) ||
  'Não foi possível concluir. Tente novamente.';
