import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { createCheckin, getUserCheckins, getStreak, Checkin as CheckinType } from '../../services/checkinService';

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const Checkin = () => {
  const { user } = useAuthStore();
  const [checkins, setCheckins] = useState<CheckinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  useEffect(() => {
    if (!user) return;
    loadCheckins();
  }, [user]);

  const loadCheckins = async () => {
    setLoading(true);
    const data = await getUserCheckins(user!.uid);
    setCheckins(data);
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
      await loadCheckins();
    }
    setCheckinLoading(false);
    setTimeout(() => setCheckinMsg(''), 3000);
  };

  const checkinDates = new Set(checkins.map((c) => c.date));
  const streak = getStreak(checkins);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const checkedToday = checkinDates.has(todayStr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-1">Check-in ✅</h1>
      <p className="text-white/40 text-sm mb-6">Registre sua presença diária</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: checkins.length.toString(), icon: '✅' },
          { label: 'Sequência', value: `${streak}d`, icon: '🔥' },
          { label: 'Este mês', value: checkins.filter(c => c.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length.toString(), icon: '📅' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-white/40 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Botão check-in */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-6">
        {checkinMsg && (
          <p className="text-sm text-center mb-3 text-white/70">{checkinMsg}</p>
        )}
        <button
          onClick={handleCheckin}
          disabled={checkinLoading || checkedToday}
          className={`w-full font-semibold py-3 rounded-lg transition-all ${
            checkedToday
              ? 'bg-green-600/20 text-green-400 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {checkedToday ? '✅ Check-in feito hoje!' : checkinLoading ? 'Registrando...' : '✅ Fazer Check-in'}
        </button>
      </div>

      {/* Calendário */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
          {monthNames[month]} {year}
        </h2>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-white/30 py-1">{d}</div>
          ))}
        </div>

        {/* Dias */}
        {loading ? (
          <div className="h-40 animate-pulse bg-white/5 rounded-lg" />
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
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    isChecked
                      ? 'bg-indigo-600 text-white'
                      : isToday
                      ? 'border border-indigo-500 text-indigo-400'
                      : 'text-white/30'
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