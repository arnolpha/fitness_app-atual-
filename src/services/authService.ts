import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseError } from 'firebase/app';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential':      'E-mail ou senha inválidos.',
  'auth/user-not-found':          'E-mail ou senha inválidos.',
  'auth/wrong-password':          'E-mail ou senha inválidos.',
  'auth/email-already-in-use':    'Este e-mail já está cadastrado.',
  'auth/weak-password':           'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-email':           'E-mail inválido.',
  'auth/too-many-requests':       'Muitas tentativas. Tente novamente em instantes.',
  'auth/network-request-failed':  'Sem conexão. Verifique sua internet.',
};

const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return AUTH_MESSAGES[error.code] ?? 'Erro inesperado. Tente novamente.';
  }
  return 'Erro inesperado. Tente novamente.';
};

export const loginWithEmail = async ({ email, password }: LoginInput): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const registerWithEmail = async ({ name, email, password }: RegisterInput): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }
    return result.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = async (displayName: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Usuário não autenticado.');
  await updateProfile(auth.currentUser, { displayName });
};