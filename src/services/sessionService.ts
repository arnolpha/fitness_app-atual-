import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../utils/firebaseErrors';

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

export const saveSession = async (session: Omit<WorkoutSession, 'id'>): Promise<string> => {
  try {
    const ref = await addDoc(collection(db, 'sessions'), {
      ...session,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getUserSessions = async (userId: string): Promise<WorkoutSession[]> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkoutSession));
  } catch (error) {
    handleFirestoreError(error);
  }
};