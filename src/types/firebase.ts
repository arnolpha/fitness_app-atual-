import { Timestamp } from 'firebase/firestore';

/**
 * Representa um campo de data do Firestore.
 * Pode ser um Timestamp (quando lido do Firestore) ou string ISO (quando salvo manualmente).
 */
export type FirestoreDate = Timestamp | string | null;

/**
 * Converte FirestoreDate para Date nativo do JavaScript.
 */
export const toDate = (value: FirestoreDate): Date | null => {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Timestamp) return value.toDate();
  return null;
};

/**
 * Retorna a data local no formato YYYY-MM-DD.
 * Evita o bug de timezone com toISOString() que retorna UTC.
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};