import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AchievementId, UserAchievement, ACHIEVEMENTS } from '../types/achievements';
import { handleFirestoreError } from '../utils/firebaseErrors';

export interface AchievementsDoc {
  userId: string;
  unlocked: UserAchievement[];
  weeklyGoalsCompleted: number;
}

export const getAchievements = async (userId: string): Promise<AchievementsDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'achievements', userId));
    if (!snap.exists()) return null;
    return snap.data() as AchievementsDoc;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const unlockAchievement = async (
  userId: string,
  achievementId: AchievementId
): Promise<void> => {
  try {
    const ref = doc(db, 'achievements', userId);
    const snap = await getDoc(ref);

    const newAchievement: UserAchievement = {
      id: achievementId,
      unlockedAt: new Date().toISOString(),
    };

    if (!snap.exists()) {
      await setDoc(ref, {
        userId,
        unlocked: [newAchievement],
        weeklyGoalsCompleted: 0,
      });
    } else {
      const data = snap.data() as AchievementsDoc;
      const alreadyUnlocked = data.unlocked.some((a) => a.id === achievementId);
      if (!alreadyUnlocked) {
        await updateDoc(ref, {
          unlocked: arrayUnion(newAchievement),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const incrementWeeklyGoals = async (userId: string): Promise<void> => {
  try {
    const ref = doc(db, 'achievements', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { userId, unlocked: [], weeklyGoalsCompleted: 1 });
    } else {
      const current = (snap.data() as AchievementsDoc).weeklyGoalsCompleted || 0;
      await updateDoc(ref, { weeklyGoalsCompleted: current + 1 });
    }
  } catch (error) {
    handleFirestoreError(error);
  }
};

/**
 * Verifica quais conquistas devem ser desbloqueadas com base nas estatísticas atuais.
 */
export const checkAndUnlockAchievements = async (
  userId: string,
  stats: { workouts: number; checkins: number; streak: number; weeklyGoalsCompleted: number }
): Promise<AchievementId[]> => {
  const doc_data = await getAchievements(userId);
  const unlocked = new Set(doc_data?.unlocked.map((a) => a.id) ?? []);
  const newlyUnlocked: AchievementId[] = [];

  const check = async (id: AchievementId, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      await unlockAchievement(userId, id);
      newlyUnlocked.push(id);
    }
  };

  await Promise.all([
    check('first_workout',  stats.workouts >= 1),
    check('workout_5',      stats.workouts >= 5),
    check('workout_10',     stats.workouts >= 10),
    check('workout_25',     stats.workouts >= 25),
    check('workout_50',     stats.workouts >= 50),
    check('workout_100',    stats.workouts >= 100),
    check('first_checkin',  stats.checkins >= 1),
    check('checkin_7',      stats.checkins >= 7),
    check('checkin_30',     stats.checkins >= 30),
    check('checkin_100',    stats.checkins >= 100),
    check('streak_3',       stats.streak >= 3),
    check('streak_7',       stats.streak >= 7),
    check('streak_14',      stats.streak >= 14),
    check('streak_30',      stats.streak >= 30),
    check('weekly_goal_1',  stats.weeklyGoalsCompleted >= 1),
    check('weekly_goal_4',  stats.weeklyGoalsCompleted >= 4),
    check('weekly_goal_12', stats.weeklyGoalsCompleted >= 12),
  ]);

  return newlyUnlocked;
};