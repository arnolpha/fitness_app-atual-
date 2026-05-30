import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserExercises, Exercise } from '../../services/exerciseService';
import { saveSession, Serie } from '../../services/sessionService';
import { Workout } from '../../services/workoutService';
import {
  Timer,
  Plus,
  Trash2,
  CheckCircle,
  ChevronDown,
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
  exercise: Exercise | null;
  sets: SetEntry[];
}

export const WorkoutSession = ({ workout, onFinish, onCancel }: Props) => {
  const { user } = useAuthStore();
  const [seconds, setSeconds] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>([
    { exercise: null, sets: [{ reps: '', weight: '' }] },
  ]);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserExercises(user.uid).then(setExercises);
  }, [user]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { exercise: null, sets: [{ reps: '', weight: '' }] }]);
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (entryIndex: number) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === entryIndex
          ? { ...entry, sets: [...entry.sets, { reps: '', weight: '' }] }
          : entry
      )
    );
  };

  const removeSet = (entryIndex: number, setIndex: number) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === entryIndex
          ? { ...entry, sets: entry.sets.filter((_, si) => si !== setIndex) }
          : entry
      )
    );
  };

  const updateSet = (entryIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === entryIndex
          ? {
              ...entry,
              sets: entry.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : entry
      )
    );
  };

  const selectExercise = (entryIndex: number, exercise: Exercise) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === entryIndex ? { ...entry, exercise } : entry
      )
    );
    setShowExercisePicker(null);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    const series: Serie[] = entries
      .filter((e) => e.exercise)
      .map((e) => ({
        exerciseId: e.exercise!.id!,
        exerciseName: e.exercise!.name,
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
        <button
          onClick={onCancel}
          className="text-white/30 hover:text-white transition-colors"
        >
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

      {/* Exercicios */}
      <div className="space-y-4 mb-6">
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex} className="bg-[#111] border border-white/5 rounded-2xl p-4">
            {/* Selecionar exercicio */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowExercisePicker(
                  showExercisePicker === entryIndex ? null : entryIndex
                )}
                className="flex items-center gap-2 flex-1"
              >
                <div className="flex-1 text-left">
                  {entry.exercise ? (
                    <p className="font-bold text-white">{entry.exercise.name}</p>
                  ) : (
                    <p className="text-white/30 text-sm">Selecionar exercicio</p>
                  )}
                </div>
                <ChevronDown size={16} className="text-white/30" />
              </button>
              <button
                onClick={() => removeEntry(entryIndex)}
                className="ml-3 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Picker de exercicio */}
            <AnimatePresence>
              {showExercisePicker === entryIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-[#0a0a0a] rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
                    {exercises.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-4">
                        Nenhum exercicio cadastrado
                      </p>
                    ) : (
                      exercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => selectExercise(entryIndex, ex)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <p className="text-white text-sm font-semibold">{ex.name}</p>
                          <p className="text-white/30 text-xs">{ex.category} · {ex.muscle}</p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Series */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 mb-1">
                <p className="text-xs text-white/30 font-semibold uppercase text-center">Serie</p>
                <p className="text-xs text-white/30 font-semibold uppercase text-center">Peso (kg)</p>
                <p className="text-xs text-white/30 font-semibold uppercase text-center">Reps</p>
              </div>
              {entry.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-3 gap-2 items-center">
                  <div className="flex items-center justify-center">
                    <span className="text-white/40 text-sm font-bold">{setIndex + 1}</span>
                    {entry.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(entryIndex, setIndex)}
                        className="ml-2 text-white/10 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => updateSet(entryIndex, setIndex, 'weight', e.target.value)}
                    placeholder="0"
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center outline-none focus:border-green-500/50 transition-colors"
                  />
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(entryIndex, setIndex, 'reps', e.target.value)}
                    placeholder="0"
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center outline-none focus:border-green-500/50 transition-colors"
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

      {/* Adicionar exercicio */}
      <button
        onClick={addEntry}
        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white font-semibold py-3.5 rounded-xl transition-all mb-4 text-sm"
      >
        <Plus size={16} />
        Adicionar exercicio
      </button>

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