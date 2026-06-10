import { Workout } from './workoutService';
import { Checkin } from './checkinService';

export interface AppNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: { label: string; path: string };
}

const daysOfWeekMap: Record<string, number> = {
  'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sab': 6,
};

export const generateNotifications = (
  workouts: Workout[],
  checkins: Checkin[]
): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDay = today.getDay();

  // Verificar check-in de hoje
  const checkedToday = checkins.some((c) => c.date === todayStr);
  if (!checkedToday) {
    notifications.push({
      id: 'checkin-today',
      type: 'warning',
      title: 'Check-in pendente',
      message: 'Voce ainda nao registrou presenca hoje!',
      action: { label: 'Fazer check-in', path: '/checkin' },
    });
  }

  // Verificar streak em risco
  if (checkins.length > 0) {
    const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
    const lastCheckin = sorted[0].date;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastCheckin === yesterdayStr && !checkedToday) {
      notifications.push({
        id: 'streak-risk',
        type: 'warning',
        title: 'Streak em risco!',
        message: 'Faca check-in hoje para nao perder sua sequencia.',
        action: { label: 'Fazer check-in', path: '/checkin' },
      });
    }
  }

  // Verificar treino programado para hoje
  const todayWorkouts = workouts.filter((w) =>
    w.days.some((d) => daysOfWeekMap[d] === todayDay)
  );

  todayWorkouts.forEach((workout) => {
    notifications.push({
      id: `workout-${workout.id}`,
      type: 'info',
      title: 'Treino programado hoje',
      message: `Hoje e dia de ${workout.name}!`,
      action: { label: 'Iniciar treino', path: '/workouts' },
    });
  });

  // Sem treinos cadastrados
  if (workouts.length === 0) {
    notifications.push({
      id: 'no-workouts',
      type: 'info',
      title: 'Nenhum treino cadastrado',
      message: 'Crie seu primeiro treino para comecar!',
      action: { label: 'Criar treino', path: '/workouts' },
    });
  }

  return notifications;
};