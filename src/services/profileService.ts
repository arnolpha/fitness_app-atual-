import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  userId: string;
  displayName?: string;
  sex?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  city?: string;
  state?: string;
  updatedAt?: any;
}

export const saveProfile = async (profile: UserProfile) => {
  await setDoc(doc(db, 'profiles', profile.userId), {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'profiles', userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
};