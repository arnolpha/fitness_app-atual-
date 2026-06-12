import { motion } from 'framer-motion';
import { Dumbbell, CalendarCheck, Flame, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from './hooks/useDashboard';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading, checkinLoading, checkinMsg, checkedToday, firstName, checkin } = useDashboard();

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
        <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-2">
          Bem-vindo de volta
        </p>
        <h1 className="text-5xl font-black text-white leading-none">{firstName}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            {[1,2,3].map((i) => (
              <div key={i} className="bg-[#111] rounded-2xl p-5 animate-pulse h-32" />
            ))}
          </>
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#111] border border-white/5 rounded-2xl p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-white/40 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Check-in */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-4">
        <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
          Check-in de hoje
        </p>
        {checkinMsg && (
          <p className="text-base text-center mb-3 text-green-400 font-medium">{checkinMsg}</p>
        )}
        <button
          onClick={checkin}
          disabled={checkinLoading || checkedToday}
          className={`w-full font-bold py-4 rounded-xl transition-all text-base ${
            checkedToday
              ? 'bg-green-500/15 text-green-400 cursor-default'
              : 'bg-green-500 hover:bg-green-400 text-black'
          }`}
        >
          {checkedToday ? 'Check-in feito hoje!' : checkinLoading ? 'Registrando...' : 'Fazer Check-in'}
        </button>
      </div>

      {/* Inicio rapido */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
        <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
          Inicio rapido
        </p>
        <button
          onClick={() => navigate('/workouts')}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-green-500 hover:text-black text-white font-bold py-4 rounded-xl transition-all text-base border border-white/5"
        >
          <Plus size={20} />
          Iniciar Treino
        </button>
      </div>
    </motion.div>
  );
};