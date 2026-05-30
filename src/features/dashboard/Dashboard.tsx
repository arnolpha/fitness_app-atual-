import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins, createCheckin, getStreak } from '../../services/checkinService';
import { Dumbbell, CalendarCheck, Flame, Plus, Zap } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ workouts: 0, checkins: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);

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
    const today = new Date().toISOString().split('T')[0];
    setCheckedToday(checkins.some((c) => c.date === today));
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
      setCheckinMsg('Voce ja fez check-in hoje!');
    } else {
      setCheckinMsg('Check-in realizado!');
      await loadStats();
    }
    setCheckinLoading(false);
    setTimeout(() => setCheckinMsg(''), 3000);
  };

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';

  const statCards = [
    { label: 'Treinos', value: stats.workouts, icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Check-ins', value: stats.checkins, icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Sequencia', value: `${stats.streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo de volta</p>
        <h1 className="text-4xl font-black text-white leading-none">{firstName}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#111] rounded-2xl p-4 border border-white/5"
            >
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg" />
                  <div className="h-7 w-12 bg-white/10 rounded" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
              ) : (
                <>
                  <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs font-medium mt-1">{stat.label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Check-in */}
      <div className="bg-[#111] rounded-2xl p-5 mb-4 border border-white/5">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Check-in de hoje</p>
        {checkinMsg && (
          <p className="text-sm text-center mb-3 text-green-400 font-medium">{checkinMsg}</p>
        )}
        <button
          onClick={handleCheckin}
          disabled={checkinLoading || checkedToday}
          className={`w-full font-bold py-3.5 rounded-xl transition-all text-sm ${
            checkedToday
              ? 'bg-green-500/15 text-green-400 cursor-default'
              : 'bg-green-500 hover:bg-green-400 text-black'
          }`}
        >
          {checkedToday ? 'Check-in feito hoje!' : checkinLoading ? 'Registrando...' : 'Fazer Check-in'}
        </button>
      </div>

      {/* Inicio rapido */}
      <div className="bg-[#111] rounded-2xl p-5 border border-white/5">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Inicio rapido</p>
        <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 rounded-xl transition-all text-sm border border-white/5">
          <Plus size={18} />
          Iniciar Treino
        </button>
      </div>
    </motion.div>
  );
};