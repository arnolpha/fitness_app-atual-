import { FirestoreDate } from './firebase';

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface Serie {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id?: string;
  userId: string;
  workoutId: string;
  workoutName: string;
  duration: number;
  series: Serie[];
  createdAt?: FirestoreDate;
}

export type CreateSessionInput = Omit<WorkoutSession, 'id' | 'createdAt'>;