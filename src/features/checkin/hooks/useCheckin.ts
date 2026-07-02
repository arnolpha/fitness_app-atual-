import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createCheckin,
  getUserCheckins,
  getStreak,
} from '../../../services/checkinService';
import {
  checkAndUnlockAchievements,
  getAchievements,
} from '../../../services/achievementService';
import { getLocalDateString } from '../../../types';
import { ACHIEVEMENTS } from '../../../types/achievements';
import { useToast } from '../../../components/Toast';
import { useState } from 'react';

export const useCheckin = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const toast = useToast();
  const uid = user?.uid;
  const [message, setMessage] = useState('');

  const query = useQuery({
    queryKey: ['checkins', uid],
    queryFn: () => getUserCheckins(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 2,
  });

  const checkins = query.data ?? [];
  const today = getLocalDateString();
  const checkedToday = checkins.some((c) => c.date === today);
  const streak = getStreak(checkins);

  const thisMonthCount = checkins.filter((c) => {
    const now = new Date();
    return c.date.startsWith(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    );
  }).length;

  const checkinMutation = useMutation({
    mutationFn: () => createCheckin(uid!),
    onSuccess: async (result) => {
      if (result === 'already_checked') {
        setMessage('Você já fez check-in hoje!');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      setMessage('Check-in realizado!');
      queryClient.invalidateQueries({ queryKey: ['checkins', uid] });

      // ✅ Verificar conquistas após check-in
      try {
        const [updatedCheckins, achievementsDoc] = await Promise.all([
          getUserCheckins(uid!),
          getAchievements(uid!),
        ]);

        const newStreak = getStreak(updatedCheckins);
        const weeklyGoalsCompleted = achievementsDoc?.weeklyGoalsCompleted ?? 0;

        const newlyUnlocked = await checkAndUnlockAchievements(uid!, {
          workouts: 0, // não altera workouts no check-in
          checkins: updatedCheckins.length,
          streak: newStreak,
          weeklyGoalsCompleted,
        });

        // Mostrar toast para cada conquista desbloqueada
        if (newlyUnlocked.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['achievements', uid] });
          for (const id of newlyUnlocked) {
            const achievement = ACHIEVEMENTS.find((a) => a.id === id);
            if (achievement) {
              setTimeout(() => {
                toast.success(`${achievement.emoji} ${achievement.title} desbloqueado!`);
              }, 500);
            }
          }
        }
      } catch (e) {
        console.error('Erro ao verificar conquistas:', e);
      }

      setTimeout(() => setMessage(''), 3000);
    },
  });

  return {
    checkins,
    loading: query.isLoading,
    checking: checkinMutation.isPending,
    checkedToday,
    message,
    streak,
    thisMonthCount,
    checkin: checkinMutation.mutate,
    reload: query.refetch,
  };
};