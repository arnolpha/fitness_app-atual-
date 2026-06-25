import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../utils/firebaseErrors';

export interface Workout {
  id?: string;
  name: string;
  days: string[];
  exercises: string[];
  exerciseNames?: string[];
  duration: string;
  userId: string;
  createdAt?: any;
}

export const createWorkout = async (workout: Omit<Workout, 'id'>): Promise<string> => {
  try {
    const ref = await addDoc(collection(db, 'workouts'), {
      ...workout,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getUserWorkouts = async (userId: string): Promise<Workout[]> => {
  try {
    const q = query(collection(db, 'workouts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Workout));
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const deleteWorkout = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'workouts', id));
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const updateWorkoutExercises = async (
  workoutId: string,
  exerciseIds: string[],
  exerciseNames: string[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'workouts', workoutId), {
      exercises: exerciseIds,
      exerciseNames,
    });
  } catch (error) {
    handleFirestoreError(error);
  }
};