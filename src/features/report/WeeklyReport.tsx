import { memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserSessions } from '../../services/sessionService';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { SectionHeader, Card } from '../../components/ui';
import {
  Dumbbell, CalendarCheck, Clock, TrendingUp,
  TrendingDown, Minus, Trophy, Flame, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

/* ---------------- HELPERS ---------------- */

const getWeekRange = (offset = 0) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return { start: fmt(monday), end: fmt(sunday), monday, sunday };
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${seconds}s`;
};

const formatWeekLabel = (monday: Date, sunday: Date) => {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  return `${monday.toLocaleDateString('pt-BR', opts)} – ${sunday.toLocaleDateString('pt-BR', opts)}`;
};

const getSessionDate = (session: { createdAt?: any }): string => {
  if (!session.createdAt) return '';
  if (typeof session.createdAt === 'string') return session.createdAt.slice(0, 10);
  if (session.createdAt?.toDate) return session.createdAt.toDate().toISOString().slice(0, 10);
  if (session.createdAt?.seconds) return new Date(session.createdAt.seconds * 1000).toISOString().slice(0, 10);
  return '';
};

/* ---------------- STAT CARD ---------------- */

const StatCard = memo(({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
}) => (
  <Card>
    <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
      <span className={color}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-white/40 text-xs mt-1">{label}</p>
    {sub && <p className={`text-xs mt-1 font-semibold ${color}`}>{sub}</p>}
  </Card>
));
StatCard.displayName = 'StatCard';

/* ---------------- COMPARATIVO ---------------- */

const Trend = memo(({ current, previous, label }: { current: number; previous: number; label: string }) => {
  const diff = current - previous;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <p className="text-white/60 text-sm">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-sm">{current}</span>
        {diff !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(diff)}
          </span>
        )}
        {diff === 0 && <Minus size={12} className="text-white/20" />}
      </div>
    </div>
  );
});
Trend.displayName = 'Trend';

/* ---------------- MAIN ---------------- */

export const WeeklyReport = () => {
  const { user } = useAuthStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['weekly-report', user?.uid],
    queryFn: async () => {
      const [sessions, checkins] = await Promise.all([
        getUserSessions(user!.uid),
        getUserCheckins(user!.uid),
      ]);
      return { sessions, checkins };
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 2,
  });

  const currentWeek = getWeekRange(weekOffset);
  const prevWeek = getWeekRange(weekOffset - 1);
  const isCurrentWeek = weekOffset === 0;

  const sessions = data?.sessions ?? [];
  const checkins = data?.checkins ?? [];

  // Sessões da semana selecionada
  const weekSessions = sessions.filter((s) => {
    const d = getSessionDate(s);
    return d >= currentWeek.start && d <= currentWeek.end;
  });

  // Sessões da semana anterior
  const prevSessions = sessions.filter((s) => {
    const d = getSessionDate(s);
    return d >= prevWeek.start && d <= prevWeek.end;
  });

  // Check-ins da semana selecionada
  const weekCheckins = checkins.filter((c) =>
    c.date >= currentWeek.start && c.date <= currentWeek.end
  );

  // Check-ins da semana anterior
  const prevCheckins = checkins.filter((c) =>
    c.date >= prevWeek.start && c.date <= prevWeek.end
  );

  // Tempo total de treino
  const totalTime = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  // Exercício mais treinado
  const exerciseCount = new Map<string, number>();
  weekSessions.forEach((s) => {
    s.series.forEach((serie) => {
      exerciseCount.set(serie.exerciseName, (exerciseCount.get(serie.exerciseName) ?? 0) + 1);
    });
  });
  const topExercise = [...exerciseCount.entries()].sort((a, b) => b[1] - a[1])[0];

  // Maior carga da semana
  let maxWeight = 0;
  let maxWeightExercise = '';
  weekSessions.forEach((s) => {
    s.series.forEach((serie) => {
      serie.sets.forEach((set) => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          maxWeightExercise = serie.exerciseName;
        }
      });
    });
  });

  // Streak atual
  const streak = getStreak(checkins);

  // Dias da semana com atividade
  const activeDays = new Set([
    ...weekSessions.map((s) => getSessionDate(s)),
    ...weekCheckins.map((c) => c.date),
  ]).size;

  const isEmpty = weekSessions.length === 0 && weekCheckins.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <SectionHeader title="Relatório" subtitle="Resumo semanal" />

      {/* Navegação de semanas */}
      <Card>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} className="text-white/60" />
          </button>

          <div className="text-center">
            <p className="text-white font-bold text-sm">
              {isCurrentWeek ? 'Esta semana' : formatWeekLabel(currentWeek.monday, currentWeek.sunday)}
            </p>
            {!isCurrentWeek && (
              <p className="text-white/30 text-xs mt-0.5">
                {formatWeekLabel(currentWeek.monday, currentWeek.sunday)}
              </p>
            )}
            {isCurrentWeek && (
              <p className="text-white/30 text-xs mt-0.5">
                {formatWeekLabel(currentWeek.monday, currentWeek.sunday)}
              </p>
            )}
          </div>

          <button
            onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))}
            disabled={isCurrentWeek}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-20"
          >
            <ChevronRight size={16} className="text-white/60" />
          </button>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : isEmpty ? (
        <Card className="text-center py-8">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/40 font-bold">Nenhuma atividade</p>
          <p className="text-white/20 text-xs mt-1">Nenhum treino ou check-in nesta semana</p>
        </Card>
      ) : (
        <>
          {/* KPIs principais */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Dumbbell size={16} />}
              label="Treinos"
              value={String(weekSessions.length)}
              color="text-green-400"
              bg="bg-green-500/10"
            />
            <StatCard
              icon={<CalendarCheck size={16} />}
              label="Check-ins"
              value={String(weekCheckins.length)}
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Tempo total"
              value={totalTime > 0 ? formatDuration(totalTime) : '—'}
              color="text-purple-400"
              bg="bg-purple-500/10"
            />
            <StatCard
              icon={<Flame size={16} />}
              label="Dias ativos"
              value={`${activeDays}/7`}
              color="text-orange-400"
              bg="bg-orange-500/10"
            />
          </div>

          {/* Destaques */}
          {(topExercise || maxWeight > 0 || streak > 0) && (
            <Card className="space-y-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Destaques</p>

              {topExercise && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Dumbbell size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Exercício mais treinado</p>
                    <p className="text-white font-bold text-sm">{topExercise[0]}</p>
                  </div>
                </div>
              )}

              {maxWeight > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy size={14} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Maior carga</p>
                    <p className="text-white font-bold text-sm">{maxWeight} kg — {maxWeightExercise}</p>
                  </div>
                </div>
              )}

              {streak > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Flame size={14} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Sequência atual</p>
                    <p className="text-white font-bold text-sm">{streak} dia{streak > 1 ? 's' : ''} consecutivo{streak > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Comparativo com semana anterior */}
          <Card className="space-y-1">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
              vs semana anterior
            </p>
            <Trend current={weekSessions.length}  previous={prevSessions.length}  label="Treinos" />
            <Trend current={weekCheckins.length}  previous={prevCheckins.length}  label="Check-ins" />
            <Trend current={activeDays}           previous={new Set([...prevSessions.map((s) => getSessionDate(s)), ...prevCheckins.map((c) => c.date)]).size} label="Dias ativos" />
          </Card>
        </>
      )}
    </motion.div>
  );
};