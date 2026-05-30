import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Serie {
  exerciseId: string;
  exerciseName: string;
  sets: { reps: number; weight: number }[];
}

export interface WorkoutSession {
  id?: string;
  userId: string;
  workoutId: string;
  workoutName: string;
  duration: number;
  series: Serie[];
  createdAt?: any;
}

export const saveSession = async (session: Omit<WorkoutSession, 'id'>) => {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserSessions = async (userId: string): Promise<WorkoutSession[]> => {
  const q = query(collection(db, 'sessions'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkoutSession));
};