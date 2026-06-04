import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createWorkout,
  getUserWorkouts,
  deleteWorkout,
  Workout,
} from '../../../services/workoutService';

export const useWorkouts = () => {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await getUserWorkouts(user!.uid);
    setWorkouts(data);
    setLoading(false);
  };

  const create = async (form: Omit<Workout, 'id' | 'userId'>) => {
    if (!user) return;
    setSaving(true);
    await createWorkout({ ...form, userId: user.uid });
    await load();
    setSaving(false);
  };

  const remove = async (id: string) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  return { workouts, loading, saving, create, remove, reload: load };
};