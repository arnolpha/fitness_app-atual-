import { FirestoreDate } from './firebase';

export type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom';

export interface Workout {
  id?: string;
  name: string;
  days: WeekDay[];
  exercises: string[];
  exerciseNames?: string[];
  duration: string;
  userId: string;
  createdAt?: FirestoreDate;
}

export type CreateWorkoutInput = Omit<Workout, 'id' | 'createdAt'>;