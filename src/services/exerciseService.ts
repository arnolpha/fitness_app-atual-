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
import { handleFirestoreError } from '../utils/firebaseErrors';

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

export const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<string> => {
  try {
    const ref = await addDoc(collection(db, 'exercises'), {
      ...exercise,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getUserExercises = async (userId: string): Promise<Exercise[]> => {
  try {
    const q = query(collection(db, 'exercises'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const deleteExercise = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'exercises', id));
  } catch (error) {
    handleFirestoreError(error);
  }
};