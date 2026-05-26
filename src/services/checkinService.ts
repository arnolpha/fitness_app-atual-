import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Checkin {
  id?: string;
  userId: string;
  date: string;
  createdAt?: any;
}

export const createCheckin = async (userId: string): Promise<string> => {
  const today = new Date().toISOString().split('T')[0];

  // Evita checkin duplicado no mesmo dia
  const q = query(
    collection(db, 'checkins'),
    where('userId', '==', userId),
    where('date', '==', today)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return 'already_checked';

  await addDoc(collection(db, 'checkins'), {
    userId,
    date: today,
    createdAt: serverTimestamp(),
  });
  return 'ok';
};

export const getUserCheckins = async (userId: string): Promise<Checkin[]> => {
  const q = query(collection(db, 'checkins'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Checkin));
};

export const getStreak = (checkins: Checkin[]): number => {
  if (checkins.length === 0) return 0;

  const dates = checkins
    .map((c) => c.date)
    .sort()
    .reverse();

  const today = new Date().toISOString().split('T')[0];
  if (dates[0] !== today) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};