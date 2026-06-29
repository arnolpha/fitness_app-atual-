import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { getProfile, saveProfile } from '../services/profileService';
import { getUserWorkouts } from '../services/workoutService';
import { getUserCheckins, getStreak } from '../services/checkinService';
import { updateUserProfile } from '../services/authService';
import { UserProfile } from '../types';

export const useProfile = (userId?: string) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const uid = userId || user?.uid;

  const query = useQuery({
    queryKey: ['profile', uid],
    queryFn: async () => {
      if (!uid) return null;
      const [profile, workouts, checkins] = await Promise.all([
        getProfile(uid),
        getUserWorkouts(uid),
        getUserCheckins(uid),
      ]);
      return {
        profile,
        stats: {
          workouts: workouts.length,
          checkins: checkins.length,
          streak: getStreak(checkins),
        },
      };
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      if (!uid) return;
      if (data.displayName) {
        await updateUserProfile(data.displayName);
      }
      await saveProfile({ ...data, userId: uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    },
  });

  return {
    profile: query.data?.profile,
    stats: query.data?.stats,
    loading: query.isLoading,
    saving: saveMutation.isPending,
    save: saveMutation.mutateAsync,
    reload: query.refetch,
  };
};