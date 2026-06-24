import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../lib/firebase';
import { getProfile, saveProfile } from '../services/profileService';
import { getUserWorkouts } from '../services/workoutService';
import { getUserCheckins, getStreak } from '../services/checkinService';
import { updateProfile } from 'firebase/auth';

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  /* ---------------- FETCH ---------------- */

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [profile, workouts, checkins] = await Promise.all([
        getProfile(userId),
        getUserWorkouts(userId),
        getUserCheckins(userId),
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
    enabled: !!userId,
  });

  /* ---------------- SAVE ---------------- */

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!auth.currentUser) return;

      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL || null,
      });

      await saveProfile({ ...data, userId: auth.currentUser.uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  return {
    profile: profileQuery.data?.profile,
    stats: profileQuery.data?.stats,
    loading: profileQuery.isLoading,
    saving: saveMutation.isPending,
    save: saveMutation.mutate,
    reload: profileQuery.refetch,
  };
}