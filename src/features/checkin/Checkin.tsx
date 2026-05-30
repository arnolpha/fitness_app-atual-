import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { createCheckin, getUserCheckins, getStreak, Checkin as CheckinType } from '../../services/checkinService';
import { CalendarCheck, Flame, Check } from 'lucide-react';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const Checkin = () => {
  const { user } = useAuthStore();
  const [checkins, setCheckins] = useState<CheckinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (!user) return;
    loadCheckins();
  }, [user]);

  const loadCheckins = async () => {
    setLoading(true);
    const data = await getUserCheckins(user!.uid);
    setCheckins(data);
    setCheckedToday(data.some((c) => c.date === todayStr));
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
      await loadCheckins();
    }
    setCheckinLoading(false);
    setTimeout(() => setCheckinMsg(''), 3000);
  };

  const checkinDates = new Set(checkins.map((c) => c.date));
  const streak = getStreak(checkins);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const thisMonthCount = checkins.filter(c =>
    c.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Presenca diaria</p>
        <h1 className="text-4xl font-black text-white leading-none">Check-in</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: checkins.length.toString(), icon: CalendarCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Sequencia', value: `${streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Este mes', value: thisMonthCount.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#111] rounded-2xl p-4 border border-white/5">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Botao */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-6">
        {checkinMsg && (
          <p className="text-sm text-center mb-3 text-green-400 font-semibold">{checkinMsg}</p>
        )}
        <button
          onClick={handleCheckin}
          disabled={checkinLoading || checkedToday}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all ${
            checkedToday
              ? 'bg-green-500/15 text-green-400 cursor-default'
              : 'bg-green-500 hover:bg-green-400 text-black'
          }`}
        >
          {checkedToday && <Check size={18} />}
          {checkedToday ? 'Check-in feito hoje!' : checkinLoading ? 'Registrando...' : 'Treinei hoje'}
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
          {monthNames[month]} {year}
        </p>

        <div className="grid grid-cols-7 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-white/20 font-semibold py-1">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="h-40 animate-pulse bg-white/5 rounded-xl" />
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
                      ? 'bg-green-500 text-black'
                      : isToday
                      ? 'border border-green-500/50 text-green-400'
                      : 'text-white/20'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};