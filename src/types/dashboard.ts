export interface DashboardStats {
  workouts: number;
  checkins: number;
  streak: number;
}

export interface ProgressionData {
  exerciseName: string;
  previous: number;
  current: number;
  difference: number;
  evolution: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
}