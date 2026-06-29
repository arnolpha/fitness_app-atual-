import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { getUserWorkouts } from '../../../services/workoutService';
import { getUserCheckins, createCheckin, getStreak } from '../../../services/checkinService';
import {
  getLastProgression,
  getPersonalRecord,
} from '../../../services/progressionService';
import { getUserSessions } from '../../../services/sessionService';

// ✅ Data local sem usar toISOString() — evita bug de timezone em São Paulo
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useDashboard = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    workouts: 0,
    checkins: 0,
    streak: 0,
  });

  const [progression, setProgression] = useState<any>(null);
  const [personalRecord, setPersonalRecord] = useState<any>(null);
  const [totalTrainingTime, setTotalTrainingTime] = useState(0);

  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [checkedToday, setCheckedToday] = useState(false);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);

    const [
      workouts,
      checkins,
      progressionData,
      personalRecordData,
      sessions,
    ] = await Promise.all([
      getUserWorkouts(user!.uid),
      getUserCheckins(user!.uid),
      getLastProgression(user!.uid),
      getPersonalRecord(user!.uid),
      getUserSessions(user!.uid),
    ]);

    // ✅ Usa data local em vez de toISOString()
    const today = getLocalDateString();

    setCheckedToday(checkins.some((c) => c.date === today));

    setStats({
      workouts: workouts.length,
      checkins: checkins.length,
      streak: getStreak(checkins),
    });

    const totalSeconds = sessions.reduce(
      (acc, session) => acc + (session.duration || 0),
      0
    );

    setTotalTrainingTime(totalSeconds);
    setProgression(progressionData);
    setPersonalRecord(personalRecordData);

    setLoading(false);
  };

  const checkin = async () => {
    if (!user) return;

    setCheckinLoading(true);

    const result = await createCheckin(user.uid);

    if (result === 'already_checked') {
      setCheckinMsg('Você já fez check-in hoje!');
    } else {
      setCheckinMsg('Check-in realizado!');
      await load();
    }

    setCheckinLoading(false);
    setTimeout(() => setCheckinMsg(''), 3000);
  };

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Atleta';

  return {
    stats,
    progression,
    personalRecord,
    totalTrainingTime,
    loading,
    checkinLoading,
    checkinMsg,
    checkedToday,
    firstName,
    checkin,
  };
};