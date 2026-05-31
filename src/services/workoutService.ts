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

export const createWorkout = async (workout: Omit<Workout, 'id'>) => {
  const ref = await addDoc(collection(db, 'workouts'), {
    ...workout,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserWorkouts = async (userId: string): Promise<Workout[]> => {
  const q = query(collection(db, 'workouts'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Workout));
};

export const deleteWorkout = async (id: string) => {
  await deleteDoc(doc(db, 'workouts', id));
};

export const updateWorkoutExercises = async (
  workoutId: string,
  exerciseIds: string[],
  exerciseNames: string[]
) => {
  await updateDoc(doc(db, 'workouts', workoutId), {
    exercises: exerciseIds,
    exerciseNames,
  });
};