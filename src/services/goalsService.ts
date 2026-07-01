import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WeeklyGoal, WeeklyProgress } from '../types/goals';
import { handleFirestoreError } from '../utils/firebaseErrors';
import { getLocalDateString } from '../types';

export interface GoalsDoc {
  userId: string;
  weeklyGoal: WeeklyGoal;
}

const DEFAULT_GOAL: WeeklyGoal = {
  workoutsPerWeek: 3,
  checkinPerWeek: 5,
};

export const getGoals = async (userId: string): Promise<GoalsDoc> => {
  try {
    const snap = await getDoc(doc(db, 'goals', userId));
    if (!snap.exists()) {
      return { userId, weeklyGoal: DEFAULT_GOAL };
    }
    return snap.data() as GoalsDoc;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const saveGoals = async (userId: string, goal: WeeklyGoal): Promise<void> => {
  try {
    await setDoc(doc(db, 'goals', userId), { userId, weeklyGoal: goal }, { merge: true });
  } catch (error) {
    handleFirestoreError(error);
  }
};

/**
 * Calcula o progresso da semana atual (segunda a domingo).
 */
export const calculateWeeklyProgress = (
  checkinDates: string[],
  sessionDates: string[],
  goal: WeeklyGoal
): WeeklyProgress => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const weekStart = fmt(monday);
  const weekEnd = fmt(sunday);

  const checkinsDone = checkinDates.filter((d) => d >= weekStart && d <= weekEnd).length;
  const workoutsDone = sessionDates.filter((d) => d >= weekStart && d <= weekEnd).length;

  return {
    workoutsDone,
    checkinsDone,
    workoutsGoal: goal.workoutsPerWeek,
    checkinsGoal: goal.checkinPerWeek,
    weekStart,
    weekEnd,
  };
};