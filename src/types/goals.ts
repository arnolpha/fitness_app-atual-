export interface WeeklyGoal {
  workoutsPerWeek: number;
  checkinPerWeek: number;
}

export interface WeeklyProgress {
  workoutsDone: number;
  checkinsDone: number;
  workoutsGoal: number;
  checkinsGoal: number;
  weekStart: string;
  weekEnd: string;
}