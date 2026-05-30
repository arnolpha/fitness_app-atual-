import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserExercises } from '../../services/exerciseService';
import { TrendingUp, Activity, Flame } from 'lucide-react';

export const Evolution = () => {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);

    const w = await getUserWorkouts(user!.uid);
    const e = await getUserExercises(user!.uid);

    setWorkouts(w);
    setExercises(e);

    setLoading(false);
  };

  const kpis = generateKPIs(workouts, exercises);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-widest">
          Performance
        </p>

        <h1 className="text-4xl font-black text-white">
          Evolução
        </h1>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KpiCard
          title="Treinos"
          value={kpis.totalWorkouts}
          icon={<Activity size={16} />}
        />

        <KpiCard
          title="Exercícios"
          value={kpis.totalExercises}
          icon={<TrendingUp size={16} />}
        />

        <KpiCard
          title="Streak"
          value={`${kpis.streak} dias`}
          icon={<Flame size={16} />}
        />

        <KpiCard
          title="Volume"
          value={kpis.volume}
          icon={<TrendingUp size={16} />}
        />
      </div>

      {/* CHART MOCK - LINE PROGRESS */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-6">
        <p className="text-xs text-white/40 uppercase mb-3">
          Evolução semanal
        </p>

        <div className="flex items-end gap-2 h-24">
          {mockProgress().map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-green-500/70 rounded-md"
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
      </div>

      {/* FREQUENCY CHART */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase mb-3">
          Frequência de treino
        </p>

        <div className="grid grid-cols-7 gap-2">
          {mockFrequency().map((v, i) => (
            <div
              key={i}
              className={`h-10 rounded-md ${
                v
                  ? 'bg-green-500/70'
                  : 'bg-white/5'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ===================== */
/* KPI CARD */
/* ===================== */

function KpiCard({ title, value, icon }: any) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between text-white/40 text-xs">
        <span>{title}</span>
        {icon}
      </div>

      <p className="text-xl font-black text-white mt-2">
        {value}
      </p>
    </div>
  );
}

/* ===================== */
/* MOCK DATA (UX PLACEHOLDER) */
/* ===================== */

function mockProgress() {
  return [30, 45, 60, 40, 70, 85, 65];
}

function mockFrequency() {
  return [1, 1, 0, 1, 1, 0, 1];
}

/* ===================== */
/* KPIs LOGIC */
/* ===================== */

function generateKPIs(workouts: any[], exercises: any[]) {
  return {
    totalWorkouts: workouts.length,
    totalExercises: exercises.length,

    // simplificado por enquanto (UX layer)
    streak: Math.min(workouts.length, 12),

    volume: `${workouts.length * 120}kg`,
  };
}