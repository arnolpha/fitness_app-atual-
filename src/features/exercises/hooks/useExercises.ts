import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createExercise,
  getUserExercises,
  deleteExercise,
} from '../../../services/exerciseService';
import { CreateExerciseInput } from '../../../types';

export const useExercises = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  const query = useQuery({
    queryKey: ['exercises', uid],
    queryFn: () => getUserExercises(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: (form: CreateExerciseInput) =>
      createExercise({ ...form, userId: uid! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', uid] });
    },
  });

  return {
    exercises: query.data ?? [],
    loading: query.isLoading,
    saving: createMutation.isPending,
    create: createMutation.mutateAsync,
    remove: deleteMutation.mutate,
    reload: query.refetch,
  };
};