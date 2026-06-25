import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserSessions, WorkoutSession } from '../../services/sessionService';
import { TrendingUp, Dumbbell, CalendarCheck, Flame, ChevronDown } from 'lucide-react';
import { Card, SectionHeader, Skeleton } from '../../components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const Evolution = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [checkinChart, setCheckinChart] = useState<{ month: string; checkins: number }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<string[]>([]);
  const [showExPicker, setShowExPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [checkins, workouts, sessionData] = await Promise.all([
      getUserCheckins(user!.uid),
      getUserWorkouts(user!.uid),
      getUserSessions(user!.uid),
    ]);

    setStreak(getStreak(checkins));
    setTotalCheckins(checkins.length);
    setTotalWorkouts(workouts.length);
    setSessions(sessionData);

    const monthMap: Record<string, number> = {};
    checkins.forEach((c) => {
      const month = c.date.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
      '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
      '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
    };

    setCheckinChart(
      Object.entries(monthMap).sort().map(([key, value]) => ({
        month: `${monthNames[key.slice(5)]}/${key.slice(2, 4)}`,
        checkins: value,
      }))
    );

    const exNames = new Set<string>();
    sessionData.forEach((s) => s.series.forEach((serie) => exNames.add(serie.exerciseName)));
    const list = Array.from(exNames);
    setExerciseList(list);
    if (list.length > 0) setSelectedExercise(list[0]);

    setLoading(false);
  };

  const exerciseChartData = sessions
    .filter((s) => s.series.some((serie) => serie.exerciseName === selectedExercise))
    .map((s) => {
      const serie = s.series.find((se) => se.exerciseName === selectedExercise);
      const maxWeight = serie ? Math.max(...serie.sets.map((set) => set.weight)) : 0;
      const totalReps = serie ? serie.sets.reduce((acc, set) => acc + set.reps, 0) : 0;
      const date = s.createdAt?.toDate
        ? s.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : '';
      return { date, peso: maxWeight, reps: totalReps };
    });

  const statCards = [
    { label: 'Treinos', value: totalWorkouts.toString(), icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Check-ins', value: totalCheckins.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Sequencia', value: `${streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const tooltipStyle = {
    backgroundColor: '#1a1a1a',
    border: '1px solid #22c55e20',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SectionHeader title="Evolução" subtitle="Seu progresso" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {loading ? (
          <Skeleton className="h-28" count={3} />
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={16} className={stat.color} />
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-white/40 text-xs font-medium mt-1">{stat.label}</p>
              </Card>
            );
          })
        )}
      </div>

      {/* Gráfico de evolução por exercício */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-green-400" />
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Evolução por exercício
          </p>
        </div>

        {exerciseList.length > 0 && (
          <div className="relative mb-4">
            <button
              onClick={() => setShowExPicker(!showExPicker)}
              className="w-full flex items-center justify-between bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <span>{selectedExercise || 'Selecionar exercício'}</span>
              <ChevronDown size={16} className="text-white/30" />
            </button>

            {showExPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-white/10 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                {exerciseList.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setSelectedExercise(ex); setShowExPicker(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${
                      selectedExercise === ex ? 'text-green-400 font-bold' : 'text-white'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <Skeleton className="h-48" />
        ) : exerciseChartData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
            <Dumbbell size={32} />
            <p>Finalize treinos para ver sua evolução</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/30 font-semibold mb-2">Peso maximo (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={exerciseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="peso" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Peso kg" />
              </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-white/30 font-semibold mb-2 mt-4">Total de reps</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={exerciseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="reps" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: '#60a5fa', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Reps" />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>

      {/* Grafico checkins */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-6">
          <CalendarCheck size={16} className="text-blue-400" />
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Check-ins por mes</p>
        </div>

        {loading ? (
          <Skeleton className="h-48" />
        ) : checkinChart.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/20 text-sm">
            Faca check-ins para ver o grafico
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={checkinChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="checkins" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Motivacao */}
      <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5">
        <p className="text-green-400 text-sm font-semibold">
          {streak >= 7
            ? `Incrivel! ${streak} dias seguidos. Voce e imparavel!`
            : streak >= 3
            ? `${streak} dias de sequencia. Continue assim!`
            : streak === 1
            ? 'Otimo comeco! Volte amanha para manter a sequencia.'
            : 'Faca seu primeiro check-in para comecar sua jornada!'}
        </p>
      </div>
    </motion.div>
  );
};