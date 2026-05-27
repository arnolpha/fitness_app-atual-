import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Exercise {
  id?: string;
  name: string;
  category: string;
  muscle: string;
  difficulty: string;
  equipment: string;
  userId: string;
  createdAt?: any;
}

export const createExercise = async (exercise: Omit<Exercise, 'id'>) => {
  const ref = await addDoc(collection(db, 'exercises'), {
    ...exercise,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserExercises = async (userId: string): Promise<Exercise[]> => {
  const q = query(collection(db, 'exercises'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Exercise));
};

export const deleteExercise = async (id: string) => {
  await deleteDoc(doc(db, 'exercises', id));
};