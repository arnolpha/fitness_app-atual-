export type AchievementId =
  | 'first_workout'
  | 'first_checkin'
  | 'workout_5'
  | 'workout_10'
  | 'workout_25'
  | 'workout_50'
  | 'workout_100'
  | 'checkin_7'
  | 'checkin_30'
  | 'checkin_100'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'weekly_goal_1'
  | 'weekly_goal_4'
  | 'weekly_goal_12';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
  category: 'treino' | 'checkin' | 'sequência' | 'meta';
}

export interface UserAchievement {
  id: AchievementId;
  unlockedAt: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Treinos
  { id: 'first_workout',  emoji: '🏋️', title: 'Primeiro Treino',    description: 'Complete seu primeiro treino',        category: 'treino' },
  { id: 'workout_5',      emoji: '💪', title: '5 Treinos',           description: 'Complete 5 treinos',                  category: 'treino' },
  { id: 'workout_10',     emoji: '🔟', title: '10 Treinos',          description: 'Complete 10 treinos',                 category: 'treino' },
  { id: 'workout_25',     emoji: '🥈', title: '25 Treinos',          description: 'Complete 25 treinos',                 category: 'treino' },
  { id: 'workout_50',     emoji: '🥇', title: '50 Treinos',          description: 'Complete 50 treinos',                 category: 'treino' },
  { id: 'workout_100',    emoji: '👑', title: '100 Treinos',         description: 'Complete 100 treinos',                category: 'treino' },
  // Check-ins
  { id: 'first_checkin',  emoji: '📅', title: 'Primeiro Check-in',   description: 'Faça seu primeiro check-in',          category: 'checkin' },
  { id: 'checkin_7',      emoji: '📆', title: '7 Check-ins',         description: 'Acumule 7 check-ins',                 category: 'checkin' },
  { id: 'checkin_30',     emoji: '🗓️', title: '30 Check-ins',        description: 'Acumule 30 check-ins',                category: 'checkin' },
  { id: 'checkin_100',    emoji: '🏆', title: '100 Check-ins',       description: 'Acumule 100 check-ins',               category: 'checkin' },
  // Sequências
  { id: 'streak_3',       emoji: '⚡', title: 'Sequência de 3',      description: 'Mantenha uma sequência de 3 dias',    category: 'sequência' },
  { id: 'streak_7',       emoji: '🔥', title: 'Sequência de 7',      description: 'Mantenha uma sequência de 7 dias',    category: 'sequência' },
  { id: 'streak_14',      emoji: '🌟', title: 'Sequência de 14',     description: 'Mantenha uma sequência de 14 dias',   category: 'sequência' },
  { id: 'streak_30',      emoji: '💎', title: 'Sequência de 30',     description: 'Mantenha uma sequência de 30 dias',   category: 'sequência' },
  // Metas semanais
  { id: 'weekly_goal_1',  emoji: '🎯', title: 'Primeira Meta',       description: 'Conclua sua primeira meta semanal',   category: 'meta' },
  { id: 'weekly_goal_4',  emoji: '📈', title: '4 Metas Semanais',    description: 'Conclua 4 metas semanais seguidas',   category: 'meta' },
  { id: 'weekly_goal_12', emoji: '🚀', title: '12 Metas Semanais',   description: 'Conclua 12 metas semanais seguidas',  category: 'meta' },
];