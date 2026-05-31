import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserExercises, Exercise } from '../../services/exerciseService';
import { saveSession, Serie } from '../../services/sessionService';
import { Workout } from '../../services/workoutService';
import {
  Timer,
  Plus,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react';

interface Props {
  workout: Workout;
  onFinish: () => void;
  onCancel: () => void;
}

interface SetEntry {
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetEntry[];
}

export const WorkoutSession = ({ workout, onFinish, onCancel }: Props) => {
  const { user } = useAuthStore();
  const [seconds, setSeconds] = useState(0);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    loadExercises();
  }, [user]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    const allExercises = await getUserExercises(user!.uid);
    
    // Filtra apenas os exercicios do treino
    const workoutExercises = allExercises.filter((ex) =>
      workout.exercises.includes(ex.id!)
    );

    // Se o treino tem exercicios, usa eles. Senao deixa vazio
    const initialEntries: ExerciseEntry[] = workoutExercises.map((ex) => ({
      exercise: ex,
      sets: [{ reps: '', weight: '' }],
    }));

    setEntries(initialEntries);
    setLoading(false);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const addSet = (i: number) =>
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === i ? { ...entry, sets: [...entry.sets, { reps: '', weight: '' }] } : entry
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

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

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

    setSaving(false);
    onFinish();
  };

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
        <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors">
          <X size={22} />
        </button>
      </div>

      {/* Cronometro */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
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

      {/* Loading */}
      {loading && (
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-4 animate-pulse h-32" />
          ))}
        </div>
      )}

      {/* Sem exercicios */}
      {!loading && entries.length === 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6 text-center">
          <p className="text-white/40 text-sm">Nenhum exercicio neste treino.</p>
          <p className="text-white/20 text-xs mt-1">Edite o treino e adicione exercicios.</p>
        </div>
      )}

      {/* Exercicios */}
      {!loading && (
        <div className="space-y-4 mb-6">
          {entries.map((entry, entryIndex) => (
            <div key={entryIndex} className="bg-[#111] border border-white/5 rounded-2xl p-4">
              {/* Nome do exercicio */}
              <div className="mb-4">
                <h3 className="font-black text-white">{entry.exercise.name}</h3>
                <p className="text-xs text-white/30 mt-0.5">
                  {entry.exercise.category} · {entry.exercise.muscle}
                </p>
              </div>

              {/* Series */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 mb-1">
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Serie</p>
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Peso kg</p>
                  <p className="text-xs text-white/30 font-semibold uppercase text-center">Reps</p>
                </div>

                {entry.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-3 gap-2 items-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white/40 text-sm font-bold">{setIndex + 1}</span>
                      {entry.sets.length > 1 && (
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
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center outline-none focus:border-green-500/50 transition-colors"
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(entryIndex, setIndex, 'reps', e.target.value)}
                      placeholder="0"
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center outline-none focus:border-green-500/50 transition-colors"
                    />
                  </div>
                ))}

                <button
                  onClick={() => addSet(entryIndex)}
                  className="w-full text-xs text-white/30 hover:text-green-400 font-semibold py-2 transition-colors"
                >
                  + Adicionar serie
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Finalizar */}
      <button
        onClick={handleFinish}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black py-4 rounded-xl transition-all"
      >
        <CheckCircle size={18} />
        {saving ? 'Salvando...' : 'Finalizar Treino'}
      </button>
    </motion.div>
  );
};