import { FirestoreDate } from './firebase';

export interface Checkin {
  id?: string;
  userId: string;
  date: string; // formato YYYY-MM-DD (data local)
  createdAt?: FirestoreDate;
}

export type CheckinResult = 'ok' | 'already_checked';