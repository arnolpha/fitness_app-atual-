import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { getGoals, saveGoals, calculateWeeklyProgress } from '../../services/goalsService';
import { getUserCheckins } from '../../services/checkinService';
import { getUserSessions } from '../../services/sessionService';
import { getLocalDateString } from '../../types';
import { SectionHeader, Card, Button } from '../../components/ui';
import { Target, CalendarCheck, Dumbbell, Pencil, Check, X } from 'lucide-react';
import { WeeklyGoal } from '../../types/goals';

const ProgressRing = memo(({ value, max, color }: { value: number; max: number; color: string }) => {
  const pct = Math.min(value / max, 1);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      <motion.circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">
        {value}/{max}
      </text>
    </svg>
  );
});
ProgressRing.displayName = 'ProgressRing';

export const WeeklyGoals = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<WeeklyGoal>({ workoutsPerWeek: 3, checkinPerWeek: 5 });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.uid],
    queryFn: () => getGoals(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => setForm(data.weeklyGoal),
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['weekly-progress', user?.uid],
    queryFn: async () => {
      const [checkins, sessions] = await Promise.all([
        getUserCheckins(user!.uid),
        getUserSessions(user!.uid),
      ]);

      const checkinDates = checkins.map((c) => c.date);
      const sessionDates = sessions
        .map((s) => {
          if (!s.createdAt) return '';
          if (typeof s.createdAt === 'string') return s.createdAt.slice(0, 10);
          if (s.createdAt.toDate) return s.createdAt.toDate().toISOString().slice(0, 10);
          return '';
        })
        .filter(Boolean);

      return calculateWeeklyProgress(
        checkinDates,
        sessionDates,
        goalsData?.weeklyGoal ?? { workoutsPerWeek: 3, checkinPerWeek: 5 }
      );
    },
    enabled: !!user?.uid && !!goalsData,
    staleTime: 1000 * 60 * 2,
  });

  const saveMutation = useMutation({
    mutationFn: () => saveGoals(user!.uid, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['weekly-progress', user?.uid] });
      setEditing(false);
    },
  });

  const isLoading = goalsLoading || progressLoading;
  const workoutsDone = progressData?.workoutsDone ?? 0;
  const checkinsDone = progressData?.checkinsDone ?? 0;
  const workoutsGoal = progressData?.workoutsGoal ?? form.workoutsPerWeek;
  const checkinsGoal = progressData?.checkinsGoal ?? form.checkinPerWeek;
  const weekComplete = workoutsDone >= workoutsGoal && checkinsDone >= checkinsGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <SectionHeader title="Metas Semanais" subtitle="Semana atual" />

      {/* Status da semana */}
      {weekComplete && (
        <Card className="bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-green-400 font-black">Meta da semana concluída!</p>
              <p className="text-green-400/60 text-xs mt-0.5">Parabéns pela consistência</p>
            </div>
          </div>
        </Card>
      )}

      {/* Progresso visual */}
      {isLoading ? (
        <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
      ) : (
        <Card>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-6">
            Progresso desta semana
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3">
              <ProgressRing value={workoutsDone} max={workoutsGoal} color="#22c55e" />
              <div className="text-center">
                <p className="text-white font-bold text-sm flex items-center gap-1.5 justify-center">
                  <Dumbbell size={14} className="text-green-400" />
                  Treinos
                </p>
                <p className="text-white/30 text-xs mt-0.5">meta: {workoutsGoal}x</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ProgressRing value={checkinsDone} max={checkinsGoal} color="#3b82f6" />
              <div className="text-center">
                <p className="text-white font-bold text-sm flex items-center gap-1.5 justify-center">
                  <CalendarCheck size={14} className="text-blue-400" />
                  Check-ins
                </p>
                <p className="text-white/30 text-xs mt-0.5">meta: {checkinsGoal}x</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Configurar metas */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            Configurar metas
          </p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors"
            >
              <Pencil size={12} />
              Editar
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-sm flex items-center gap-2">
                <Dumbbell size={14} className="text-green-400" />
                Treinos por semana
              </label>
              <span className="text-white font-black">{form.workoutsPerWeek}x</span>
            </div>
            {editing && (
              <input
                type="range"
                min={1}
                max={7}
                value={form.workoutsPerWeek}
                onChange={(e) => setForm({ ...form, workoutsPerWeek: Number(e.target.value) })}
                className="w-full accent-green-500"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-sm flex items-center gap-2">
                <CalendarCheck size={14} className="text-blue-400" />
                Check-ins por semana
              </label>
              <span className="text-white font-black">{form.checkinPerWeek}x</span>
            </div>
            {editing && (
              <input
                type="range"
                min={1}
                max={7}
                value={form.checkinPerWeek}
                onChange={(e) => setForm({ ...form, checkinPerWeek: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setEditing(false)}>
              <X size={16} /> Cancelar
            </Button>
            <Button fullWidth loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              <Check size={16} /> Salvar
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};