import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { getUserWorkouts } from '../../services/workoutService';
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
  const [chartData, setChartData] = useState<{ month: string; checkins: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [checkins, workouts] = await Promise.all([
      getUserCheckins(user!.uid),
      getUserWorkouts(user!.uid),
    ]);

    setStreak(getStreak(checkins));
    setTotalCheckins(checkins.length);
    setTotalWorkouts(workouts.length);

    // Agrupa check-ins por mês
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

    const data = Object.entries(monthMap)
      .sort()
      .map(([key, value]) => ({
        month: `${monthNames[key.slice(5)]}/${key.slice(2, 4)}`,
        checkins: value,
      }));

    setChartData(data);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-1">Evolução 📈</h1>
      <p className="text-white/40 text-sm mb-6">Acompanhe seu progresso</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Treinos', value: totalWorkouts.toString(), icon: '🏋️' },
          { label: 'Check-ins', value: totalCheckins.toString(), icon: '✅' },
          { label: 'Sequência', value: `${streak}d`, icon: '🔥' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 w-6 bg-white/10 rounded mx-auto" />
                <div className="h-7 w-12 bg-white/10 rounded mx-auto" />
                <div className="h-3 w-16 bg-white/10 rounded mx-auto" />
              </div>
            ) : (
              <>
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico de check-ins */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-6">
          Check-ins por mês
        </h2>

        {loading ? (
          <div className="h-48 animate-pulse bg-white/5 rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">
            Nenhum dado ainda — faça check-ins para ver o gráfico
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#ffffff50', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#ffffff50', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff15',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="checkins"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mensagem motivacional */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-5">
        <p className="text-indigo-300 text-sm font-medium">
          {streak >= 7
            ? `🔥 Incrível! ${streak} dias seguidos. Continue assim!`
            : streak >= 3
            ? `💪 ${streak} dias de sequência. Você está no caminho certo!`
            : streak === 1
            ? '✅ Ótimo começo! Volte amanhã para manter a sequência.'
            : '👋 Faça seu primeiro check-in para começar sua jornada!'}
        </p>
      </div>
    </motion.div>
  );
};