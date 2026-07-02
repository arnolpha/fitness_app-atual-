import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserExercises, Exercise } from '../../services/exerciseService';
import { saveSession, Serie } from '../../services/sessionService';
import { getUserSessions } from '../../services/sessionService';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { checkAndUnlockAchievements, getAchievements } from '../../services/achievementService';
import { ACHIEVEMENTS } from '../../types/achievements';
import { Workout } from '../../services/workoutService';
import { useToast } from '../../components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Timer, CheckCircle, X, Coffee, ChevronDown,
} from 'lucide-react';
import { Button, Card } from '../../components/ui';

interface Props {
  workout: Workout;
  onFinish: () => void;
  onCancel: () => void;
}

interface SetEntry {
  reps: string;
  weight: string;
  done: boolean;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetEntry[];
}

interface PersistedSession {
  workoutId: string;
  seconds: number;
  entries: ExerciseEntry[];
  savedAt: number;
}

const STORAGE_KEY = 'apex_active_session';

const REST_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
];

export const WorkoutSession = ({ workout, onFinish, onCancel }: Props) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [seconds, setSeconds] = useState(0);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restTime, setRestTime] = useState(60);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [restActive, setRestActive] = useState(false);
  const [showRestConfig, setShowRestConfig] = useState(false);
  const [restored, setRestored] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------------- PERSISTÊNCIA ---------------- */

  useEffect(() => {
    if (loading || entries.length === 0) return;
    const data: PersistedSession = {
      workoutId: workout.id!,
      seconds,
      entries,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [seconds, entries, loading]);

  const clearStorage = () => localStorage.removeItem(STORAGE_KEY);

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    if (!user) return;
    loadExercises();
  }, [user]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: PersistedSession = JSON.parse(raw);
        const age = Date.now() - saved.savedAt;
        if (saved.workoutId === workout.id && age < 4 * 60 * 60 * 1000) {
          setEntries(saved.entries);
          setSeconds(saved.seconds);
          setRestored(true);
          setLoading(false);
          return;
        } else {
          clearStorage();
        }
      }
    } catch {
      clearStorage();
    }

    const allExercises = await getUserExercises(user!.uid);
    const workoutExercises = allExercises.filter((ex) =>
      workout.exercises.includes(ex.id!)
    );
    setEntries(workoutExercises.map((ex) => ({
      exercise: ex,
      sets: [{ reps: '', weight: '', done: false }],
    })));
    setLoading(false);
  };

  /* ---------------- CRONÔMETRO ---------------- */

  useEffect(() => {
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  /* ---------------- DESCANSO ---------------- */

  useEffect(() => {
    if (restActive && restCountdown !== null) {
      if (restCountdown <= 0) {
        setRestActive(false);
        setRestCountdown(null);
        if (restRef.current) clearInterval(restRef.current);
        return;
      }
      restRef.current = setInterval(() => {
        setRestCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => { if (restRef.current) clearInterval(restRef.current); };
    }
  }, [restActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startRest = () => {
    if (restRef.current) clearInterval(restRef.current);
    setRestCountdown(restTime);
    setRestActive(true);
  };

  const skipRest = () => {
    if (restRef.current) clearInterval(restRef.current);
    setRestActive(false);
    setRestCountdown(null);
  };

  /* ---------------- SETS ---------------- */

  const addSet = (i: number) =>
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === i ? { ...entry, sets: [...entry.sets, { reps: '', weight: '', done: false }] } : entry
      )
    );

  const removeSet = (i: number, si: number) =>
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === i ? { ...entry, sets: entry.sets.filter((_, s) => s !== si) } : entry
      )
    );

  const updateSet = (i: number, si: number, field: 'reps' | 'weight', value: string) =>
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === i
          ? { ...entry, sets: entry.sets.map((s, sIdx) => sIdx === si ? { ...s, [field]: value } : s) }
          : entry
      )
    );

  const completeSet = (i: number, si: number) => {
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === i
          ? { ...entry, sets: entry.sets.map((s, sIdx) => sIdx === si ? { ...s, done: true } : s) }
          : entry
      )
    );
    startRest();
  };

  /* ---------------- FINALIZAR ---------------- */

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (restRef.current) clearInterval(restRef.current);

    const series: Serie[] = entries.map((e) => ({
      exerciseId: e.exercise.id!,
      exerciseName: e.exercise.name,
      sets: e.sets
        .filter((s) => s.reps || s.weight)
        .map((s) => ({
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
        })),
    }));

    await saveSession({
      userId: user.uid,
      workoutId: workout.id!,
      workoutName: workout.name,
      duration: seconds,
      series,
    });

    clearStorage();

    // ✅ Verificar conquistas após finalizar treino
    try {
      const [sessions, checkins, achievementsDoc] = await Promise.all([
        getUserSessions(user.uid),
        getUserCheckins(user.uid),
        getAchievements(user.uid),
      ]);

      const newlyUnlocked = await checkAndUnlockAchievements(user.uid, {
        workouts: sessions.length,
        checkins: checkins.length,
        streak: getStreak(checkins),
        weeklyGoalsCompleted: achievementsDoc?.weeklyGoalsCompleted ?? 0,
      });

      if (newlyUnlocked.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements', user.uid] });
        for (const id of newlyUnlocked) {
          const achievement = ACHIEVEMENTS.find((a) => a.id === id);
          if (achievement) {
            setTimeout(() => {
              toast.success(`${achievement.emoji} ${achievement.title} desbloqueado!`);
            }, 600);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard', user.uid] });
    } catch (e) {
      console.error('Erro ao verificar conquistas:', e);
    }

    setSaving(false);
    onFinish();
  };

  const handleCancel = () => {
    clearStorage();
    onCancel();
  };

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Treino ativo</p>
          <h1 className="text-2xl font-black text-white leading-none">{workout.name}</h1>
        </div>
        <button onClick={handleCancel} className="text-white/30 hover:text-white transition-colors">
          <X size={22} />
        </button>
      </div>

      {/* Banner de sessão restaurada */}
      <AnimatePresence>
        {restored && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 mb-4"
          >
            <p className="text-yellow-400 text-xs font-semibold">
              ⚡ Sessão anterior restaurada — continue de onde parou
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cronômetro */}
      <Card className="mb-4 bg-green-500/10 border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Timer size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-400/60 font-semibold uppercase tracking-widest">Tempo</p>
              <p className="text-3xl font-black text-green-400 leading-none">{formatTime(seconds)}</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </Card>

      {/* Timer de descanso */}
      <AnimatePresence>
        {restActive && restCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Coffee size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-400/60 font-semibold uppercase tracking-widest">Descanso</p>
                    <p className="text-3xl font-black text-blue-400 leading-none">
                      {String(Math.floor(restCountdown / 60)).padStart(2, '0')}:{String(restCountdown % 60).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={skipRest}
                  className="text-xs text-blue-400 font-bold bg-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Pular
                </button>
              </div>
              <div className="mt-3 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-400 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(restCountdown / restTime) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuração de descanso */}
      <div className="mb-6">
        <button
          onClick={() => setShowRestConfig(!showRestConfig)}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          <Coffee size={12} />
          Descanso: {REST_OPTIONS.find((o) => o.value === restTime)?.label}
          <ChevronDown size={12} className={`transition-transform ${showRestConfig ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showRestConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-2">
                {REST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setRestTime(opt.value); setShowRestConfig(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      restTime === opt.value
                        ? 'bg-green-500 text-black'
                        : 'bg-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-4 animate-pulse h-32" />
          ))}
        </div>
      )}

      {/* Sem exercícios */}
      {!loading && entries.length === 0 && (
        <Card className="mb-6 text-center">
          <p className="text-white/40 text-sm">Nenhum exercício neste treino.</p>
          <p className="text-white/20 text-xs mt-1">Edite o treino e adicione exercícios.</p>
        </Card>
      )}

      {/* Exercícios */}
      {!loading && (
        <div className="space-y-4 mb-6">
          {entries.map((entry, entryIndex) => (
            <Card key={entryIndex}>
              <div className="mb-4">
                <h3 className="font-black text-white">{entry.exercise.name}</h3>
                <p className="text-xs text-white/30 mt-0.5">
                  {entry.exercise.category} · {entry.exercise.muscle}
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 mb-1">
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Serie</p>
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Peso kg</p>
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Reps</p>
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">OK</p>
                </div>

                {entry.sets.map((set, setIndex) => (
                  <div key={setIndex} className={`grid grid-cols-4 gap-2 items-center p-2 rounded-xl transition-all ${set.done ? 'bg-green-500/10' : ''}`}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white/40 text-sm font-bold">{setIndex + 1}</span>
                      {entry.sets.length > 1 && !set.done && (
                        <button
                          onClick={() => removeSet(entryIndex, setIndex)}
                          className="text-white/10 hover:text-red-400 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(entryIndex, setIndex, 'weight', e.target.value)}
                      placeholder="0"
                      disabled={set.done}
                      className={`bg-[#0a0a0a] border rounded-lg px-3 py-2.5 text-sm text-white text-center outline-none transition-colors ${
                        set.done ? 'border-green-500/20 opacity-60' : 'border-white/10 focus:border-green-500/50'
                      }`}
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(entryIndex, setIndex, 'reps', e.target.value)}
                      placeholder="0"
                      disabled={set.done}
                      className={`bg-[#0a0a0a] border rounded-lg px-3 py-2.5 text-sm text-white text-center outline-none transition-colors ${
                        set.done ? 'border-green-500/20 opacity-60' : 'border-white/10 focus:border-green-500/50'
                      }`}
                    />
                    <button
                      onClick={() => !set.done && completeSet(entryIndex, setIndex)}
                      className={`w-full h-10 rounded-lg flex items-center justify-center transition-all ${
                        set.done
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 hover:bg-green-500 hover:text-black text-white/30'
                      }`}
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSet(entryIndex)}
                  className="w-full text-xs text-white/30 hover:text-green-400 font-semibold py-2 transition-colors"
                >
                  + Adicionar série
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Finalizar */}
      <Button onClick={handleFinish} loading={saving} fullWidth className="py-4">
        <CheckCircle size={18} />
        Finalizar Treino
      </Button>
    </motion.div>
  );
};