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

/**
 * Retorna a data local no formato YYYY-MM-DD respeitando o timezone do
 * dispositivo do usuário — sem usar toISOString() que sempre retorna UTC.
 */
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createCheckin = async (userId: string): Promise<string> => {
  const today = getLocalDateString();

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

  const dates = [...new Set(checkins.map((c) => c.date))]
    .sort()
    .reverse();

  const today = getLocalDateString();

  // Se não fez check-in hoje nem ontem, streak é 0
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00'); // meio-dia evita DST
    const curr = new Date(dates[i] + 'T12:00:00');
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};