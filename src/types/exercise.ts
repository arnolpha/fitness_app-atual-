import { FirestoreDate } from './firebase';

export type ExerciseCategory =
  | 'Peito'
  | 'Costas'
  | 'Ombro'
  | 'Biceps'
  | 'Triceps'
  | 'Perna'
  | 'Abdomen'
  | 'Cardio';

export type ExerciseDifficulty = 'Iniciante' | 'Intermediario' | 'Avancado';

export type ExerciseEquipment =
  | 'Barra'
  | 'Halteres'
  | 'Polia'
  | 'Maquina'
  | 'Nenhum'
  | 'Esteira'
  | 'Outro';

export interface Exercise {
  id?: string;
  name: string;
  category: ExerciseCategory;
  muscle: string;
  difficulty: ExerciseDifficulty;
  equipment: ExerciseEquipment;
  userId: string;
  createdAt?: FirestoreDate;
}

export type CreateExerciseInput = Omit<Exercise, 'id' | 'createdAt'>;