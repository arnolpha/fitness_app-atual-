import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  createCheckin,
  getUserCheckins,
  getStreak,
  Checkin,
} from '../../../services/checkinService';

// ✅ Data local sem usar toISOString() — evita bug de timezone em São Paulo
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useCheckin = () => {
  const { user } = useAuthStore();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await getUserCheckins(user!.uid);
    const today = getLocalDateString(); // ✅ data local
    setCheckins(data);
    setCheckedToday(data.some((c) => c.date === today));
    setLoading(false);
  };

  const checkin = async () => {
    if (!user) return;
    setChecking(true);
    const result = await createCheckin(user.uid);
    if (result === 'already_checked') {
      setMessage('Você já fez check-in hoje!');
    } else {
      setMessage('Check-in realizado!');
      await load();
    }
    setChecking(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const streak = getStreak(checkins);
  const today = new Date();
  const thisMonthCount = checkins.filter((c) =>
    c.date.startsWith(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    )
  ).length;

  return {
    checkins,
    loading,
    checking,
    checkedToday,
    message,
    streak,
    thisMonthCount,
    checkin,
    reload: load,
  };
};