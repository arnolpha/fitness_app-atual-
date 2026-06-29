import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createWorkout,
  getUserWorkouts,
  deleteWorkout,
} from '../../../services/workoutService';
import { CreateWorkoutInput } from '../../../types';

export const useWorkouts = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  const query = useQuery({
    queryKey: ['workouts', uid],
    queryFn: () => getUserWorkouts(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: (form: CreateWorkoutInput) =>
      createWorkout({ ...form, userId: uid! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', uid] });
    },
  });

  return {
    workouts: query.data ?? [],
    loading: query.isLoading,
    saving: createMutation.isPending,
    create: createMutation.mutateAsync,
    remove: deleteMutation.mutate,
    reload: query.refetch,
  };
};