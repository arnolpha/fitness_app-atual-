import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../utils/firebaseErrors';

export interface UserProfile {
  userId: string;
  displayName?: string;
  sex?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  city?: string;
  state?: string;
  objective?: string;
  updatedAt?: any;
}

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await setDoc(
      doc(db, 'profiles', profile.userId),
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'profiles', userId));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error);
  }
};