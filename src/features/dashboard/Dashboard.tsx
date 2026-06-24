import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfile } from '../../hooks/useProfile';
import { Card, SectionHeader } from '../../components/ui';

export const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const uid = user.uid;
  const { profile, stats } = useProfile(uid);

  const safeStats = stats ?? {
    workouts: 0,
    checkins: 0,
    streak: 0,
  };

  const bmi =
    profile?.height && profile?.weight
      ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
      : null;

  const weightProgress =
    profile?.weight && profile?.weightGoal
      ? profile.weightGoal - profile.weight
      : null;

  const workoutProgress =
    profile?.workoutsGoal
      ? `${safeStats.workouts}/${profile.workoutsGoal}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto space-y-5"
    >
      <SectionHeader title="Dashboard" subtitle="Seu progresso" />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xl font-black">{safeStats.workouts}</p>
          <p className="text-xs text-white/40">Treinos</p>
        </Card>

        <Card className="text-center">
          <p className="text-xl font-black">{safeStats.checkins}</p>
          <p className="text-xs text-white/40">Check-ins</p>
        </Card>

        <Card className="text-center">
          <p className="text-xl font-black">{safeStats.streak}d</p>
          <p className="text-xs text-white/40">Streak</p>
        </Card>
      </div>

      {/* IMC */}
      <Card className="space-y-1">
        <p className="text-white/40 text-xs">IMC</p>
        <p className="text-2xl font-black">{bmi || '—'}</p>
      </Card>

      {/* META DE PESO */}
      <Card className="space-y-1">
        <p className="text-white/40 text-xs">Meta de peso</p>

        <p className="text-white text-sm">
          {profile?.weight ?? '—'} kg → {profile?.weightGoal ?? '—'} kg
        </p>

        <p className="text-primary text-sm font-semibold">
          {weightProgress !== null
            ? `${weightProgress > 0 ? '-' : '+'}${Math.abs(weightProgress)} kg`
            : '—'}
        </p>
      </Card>

      {/* TREINOS */}
      <Card className="space-y-1">
        <p className="text-white/40 text-xs">Meta de treinos</p>
        <p className="text-white text-sm">{workoutProgress || '—'}</p>
      </Card>

      {/* STATUS RESUMIDO */}
      <Card>
        <p className="text-sm text-white/70">
          {safeStats.streak >= 5
            ? '🔥 Excelente consistência'
            : safeStats.streak >= 2
            ? '⚡ Boa evolução'
            : '📉 Precisa de constância'}
        </p>
      </Card>
    </motion.div>
  );
};