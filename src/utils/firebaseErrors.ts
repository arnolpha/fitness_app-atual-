import { FirebaseError } from 'firebase/app';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly original?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const FIREBASE_MESSAGES: Record<string, string> = {
  'permission-denied':        'Você não tem permissão para acessar esses dados.',
  'unavailable':              'Serviço indisponível. Verifique sua conexão.',
  'not-found':                'Documento não encontrado.',
  'already-exists':           'Este registro já existe.',
  'resource-exhausted':       'Limite de requisições atingido. Tente novamente em instantes.',
  'unauthenticated':          'Sessão expirada. Faça login novamente.',
  'deadline-exceeded':        'A requisição demorou demais. Verifique sua conexão.',
  'cancelled':                'Operação cancelada.',
  'internal':                 'Erro interno. Tente novamente.',
};

/**
 * Converte qualquer erro em AppError com mensagem amigável em português.
 */
export const handleFirestoreError = (error: unknown): never => {
  if (error instanceof FirebaseError) {
    const code = error.code.replace('firestore/', '');
    const message = FIREBASE_MESSAGES[code] ?? `Erro inesperado (${code}).`;
    throw new AppError(message, code, error);
  }

  if (error instanceof Error) {
    throw new AppError(error.message, 'unknown', error);
  }

  throw new AppError('Erro desconhecido. Tente novamente.', 'unknown', error);
};

/**
 * Wrapper para funções assíncronas — retorna [data, null] ou [null, AppError].
 * Uso: const [data, error] = await safeAsync(() => getUserWorkouts(uid));
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, AppError]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    if (error instanceof AppError) return [null, error];
    try {
      handleFirestoreError(error);
    } catch (appError) {
      return [null, appError as AppError];
    }
    return [null, new AppError('Erro desconhecido.')];
  }
};