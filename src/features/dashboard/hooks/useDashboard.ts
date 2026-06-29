import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { getUserWorkouts } from '../../../services/workoutService';
import { getUserCheckins, createCheckin, getStreak } from '../../../services/checkinService';
import { getLastProgression, getPersonalRecord } from '../../../services/progressionService';
import { getUserSessions } from '../../../services/sessionService';
import { getLocalDateString } from '../../../types';
import { useState } from 'react';

export const useDashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const uid = user?.uid;
  const [checkinMsg, setCheckinMsg] = useState('');

  const query = useQuery({
    queryKey: ['dashboard', uid],
    queryFn: async () => {
      const [workouts, checkins, progression, personalRecord, sessions] =
        await Promise.all([
          getUserWorkouts(uid!),
          getUserCheckins(uid!),
          getLastProgression(uid!),
          getPersonalRecord(uid!),
          getUserSessions(uid!),
        ]);

      const today = getLocalDateString();
      const totalTrainingTime = sessions.reduce(
        (acc, s) => acc + (s.duration || 0), 0
      );

      return {
        stats: {
          workouts: workouts.length,
          checkins: checkins.length,
          streak: getStreak(checkins),
        },
        checkedToday: checkins.some((c) => c.date === today),
        progression,
        personalRecord,
        totalTrainingTime,
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const checkinMutation = useMutation({
    mutationFn: () => createCheckin(uid!),
    onSuccess: (result) => {
      if (result === 'already_checked') {
        setCheckinMsg('Você já fez check-in hoje!');
      } else {
        setCheckinMsg('Check-in realizado!');
        queryClient.invalidateQueries({ queryKey: ['dashboard', uid] });
        queryClient.invalidateQueries({ queryKey: ['checkins', uid] });
      }
      setTimeout(() => setCheckinMsg(''), 3000);
    },
  });

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Atleta';

  return {
    stats: query.data?.stats ?? { workouts: 0, checkins: 0, streak: 0 },
    checkedToday: query.data?.checkedToday ?? false,
    progression: query.data?.progression ?? null,
    personalRecord: query.data?.personalRecord ?? null,
    totalTrainingTime: query.data?.totalTrainingTime ?? 0,
    loading: query.isLoading,
    checkinLoading: checkinMutation.isPending,
    checkinMsg,
    firstName,
    checkin: checkinMutation.mutate,
  };
};