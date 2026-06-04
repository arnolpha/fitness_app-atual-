import { motion } from 'framer-motion';
import { CalendarCheck, Flame, Check } from 'lucide-react';
import { useCheckin } from './hooks/useCheckin';
import { Card, SectionHeader, Button, Skeleton } from '../../components/ui';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const monthNames = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Checkin = () => {
  const { checkins, loading, checking, checkedToday, message, streak, thisMonthCount, checkin } = useCheckin();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];
  const checkinDates = new Set(checkins.map((c) => c.date));
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const statCards = [
    { label: 'Total', value: checkins.length.toString(), icon: CalendarCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Sequencia', value: `${streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Este mes', value: thisMonthCount.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SectionHeader title="Check-in" subtitle="Presenca diaria" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((stat) => {
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
        })}
      </div>

      {/* Botao */}
      <Card className="mb-6">
        {message && (
          <p className="text-sm text-center mb-3 text-green-400 font-semibold">{message}</p>
        )}
        <Button
          onClick={checkin}
          disabled={checkedToday}
          loading={checking}
          fullWidth
          variant={checkedToday ? 'secondary' : 'primary'}
        >
          {checkedToday && <Check size={18} />}
          {checkedToday ? 'Check-in feito hoje!' : 'Treinei hoje'}
        </Button>
      </Card>

      {/* Calendario */}
      <Card>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
          {monthNames[month]} {year}
        </p>

        <div className="grid grid-cols-7 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-white/20 font-semibold py-1">{d}</div>
          ))}
        </div>

        {loading ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isChecked = checkinDates.has(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    isChecked
                      ? 'bg-primary text-black'
                      : isToday
                      ? 'border border-primary/50 text-green-400'
                      : 'text-white/20'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
};