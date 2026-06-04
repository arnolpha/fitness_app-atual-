import { motion } from 'framer-motion';
import { Dumbbell, CalendarCheck, Flame, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from './hooks/useDashboard';
import { Card, SectionHeader, Skeleton, Button } from '../../components/ui';

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
      <SectionHeader title={firstName} subtitle="Bem-vindo de volta" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
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

      {/* Check-in */}
      <Card className="mb-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
          Check-in de hoje
        </p>
        {checkinMsg && (
          <p className="text-sm text-center mb-3 text-green-400 font-medium">{checkinMsg}</p>
        )}
        <Button
          onClick={checkin}
          disabled={checkedToday}
          loading={checkinLoading}
          fullWidth
          variant={checkedToday ? 'secondary' : 'primary'}
        >
          {checkedToday ? 'Check-in feito hoje!' : 'Fazer Check-in'}
        </Button>
      </Card>

      {/* Inicio rapido */}
      <Card>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
          Inicio rapido
        </p>
        <Button
          onClick={() => navigate('/workouts')}
          variant="secondary"
          fullWidth
        >
          <Plus size={18} />
          Iniciar Treino
        </Button>
      </Card>
    </motion.div>
  );
};