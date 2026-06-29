import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createCheckin,
  getUserCheckins,
  getStreak,
} from '../../../services/checkinService';
import { getLocalDateString } from '../../../types';
import { useState } from 'react';

export const useCheckin = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const uid = user?.uid;
  const [message, setMessage] = useState('');

  const query = useQuery({
    queryKey: ['checkins', uid],
    queryFn: () => getUserCheckins(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 2, // 2 minutos
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
    onSuccess: (result) => {
      if (result === 'already_checked') {
        setMessage('Você já fez check-in hoje!');
      } else {
        setMessage('Check-in realizado!');
        queryClient.invalidateQueries({ queryKey: ['checkins', uid] });
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