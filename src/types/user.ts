import { User as FirebaseUser } from 'firebase/auth';

export type { FirebaseUser };

export interface UserProfile {
  userId: string;
  displayName?: string;
  sex?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  weightGoal?: number;
  workoutsGoal?: number;
  city?: string;
  state?: string;
  objective?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}