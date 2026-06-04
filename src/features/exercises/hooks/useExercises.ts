import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createExercise,
  getUserExercises,
  deleteExercise,
  Exercise,
} from '../../../services/exerciseService';

export const useExercises = () => {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await getUserExercises(user!.uid);
    setExercises(data);
    setLoading(false);
  };

  const create = async (form: Omit<Exercise, 'id' | 'userId'>) => {
    if (!user) return;
    setSaving(true);
    await createExercise({ ...form, userId: user.uid });
    await load();
    setSaving(false);
  };

  const remove = async (id: string) => {
    await deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return { exercises, loading, saving, create, remove, reload: load };
};