import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins, createCheckin, getStreak } from '../../services/checkinService';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    workouts: 0,
    checkins: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    const [workouts, checkins] = await Promise.all([
      getUserWorkouts(user!.uid),
      getUserCheckins(user!.uid),
    ]);
    setStats({
      workouts: workouts.length,
      checkins: checkins.length,
      streak: getStreak(checkins),
    });
    setLoading(false);
  };

  const handleCheckin = async () => {
    if (!user) return;
    setCheckinLoading(true);
    const result = await createCheckin(user.uid);
    if (result === 'already_checked') {
      setCheckinMsg('✅ Você já fez check-in hoje!');
    } else {
      setCheckinMsg('🔥 Check-in realizado!');
      await loadStats();
    }
    setCheckinLoading(false);
    setTimeout(() => setCheckinMsg(''), 3000);
  };

  const statCards = [
    { label: 'Treinos', value: stats.workouts.toString(), icon: '🏋️' },
    { label: 'Check-ins', value: stats.checkins.toString(), icon: '✅' },
    { label: 'Sequência', value: `${stats.streak}d`, icon: '🔥' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-1">
        Olá, {user?.displayName || user?.email?.split('@')[0]} 👋
      </h1>
      <p className="text-white/40 text-sm mb-8">Pronto para treinar hoje?</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111] border border-white/5 rounded-xl p-4"
          >
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 w-6 bg-white/10 rounded" />
                <div className="h-7 w-12 bg-white/10 rounded mt-2" />
                <div className="h-3 w-16 bg-white/10 rounded mt-1" />
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

      <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Check-in de hoje
        </h2>
        {checkinMsg && (
          <p className="text-sm text-center mb-3 text-white/70">{checkinMsg}</p>
        )}
        <button
          onClick={handleCheckin}
          disabled={checkinLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {checkinLoading ? 'Registrando...' : '✅ Fazer Check-in'}
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Início rápido
        </h2>
        <button className="w-full bg-white/5 hover:bg-indigo-600 text-white/60 hover:text-white font-semibold py-3 rounded-lg transition-all">
          + Iniciar Treino
        </button>
      </div>
    </motion.div>
  );
};