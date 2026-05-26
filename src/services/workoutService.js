import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

const workoutsRef = collection(db, 'workouts');

export const createWorkout = async (workout) => {
  const docRef = await addDoc(workoutsRef, {
    ...workout,
    createdAt: new Date(),
  });

  return docRef.id;
};

export const getUserWorkouts = async (userId) => {
  const q = query(
    workoutsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteWorkout = async (id) => {
  await deleteDoc(doc(db, 'workouts', id));
};