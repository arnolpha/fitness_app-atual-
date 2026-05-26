import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  createWorkout,
  getUserWorkouts,
  deleteWorkout,
  Workout,
} from '../../services/workoutService';

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const Workouts = () => {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    setLoading(true);
    const data = await getUserWorkouts(user!.uid);
    setWorkouts(data);
    setLoading(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!workoutName.trim() || !user) return;
    setSaving(true);
    await createWorkout({
      name: workoutName,
      days: selectedDays,
      exercises: [],
      duration: '—',
      userId: user.uid,
    });
    setWorkoutName('');
    setSelectedDays([]);
    setShowForm(false);
    setSaving(false);
    await loadWorkouts();
  };

  const handleDelete = async (id: string) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Treinos 🏋️</h1>
          <p className="text-white/40 text-sm mt-1">
            {workouts.length} treinos cadastrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          {showForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#111] border border-indigo-500/30 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white/60 mb-4">
                NOVO TREINO
              </h2>

              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-2">
                  Nome do treino
                </label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ex: Treino A — Peito"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs text-white/40 mb-2">
                  Dias da semana
                </label>
                <div className="flex gap-2 flex-wrap">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedDays.includes(day)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!workoutName.trim() || saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                {saving ? 'Salvando...' : 'Criar Treino'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#111] border border-white/5 rounded-xl p-5 animate-pulse h-28"
            />
          ))}
        </div>
      )}

      {/* Lista */}
      {!loading && workouts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-white/30">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-sm">Nenhum treino cadastrado ainda</p>
          <p className="text-xs mt-1">Clique em + Novo para começar</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {workouts.map((workout, i) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111] border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {workout.name}
                  </h3>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {daysOfWeek.map((day) => (
                      <span
                        key={day}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          workout.days.includes(day)
                            ? 'bg-indigo-600/30 text-indigo-300'
                            : 'bg-white/5 text-white/20'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(workout.id!)}
                  className="text-red-400/50 hover:text-red-400 text-xs transition-all shrink-0"
                >
                  Excluir
                </button>
              </div>

              <button className="mt-4 w-full bg-white/5 hover:bg-indigo-600 text-white/60 hover:text-white text-sm font-medium py-2 rounded-lg transition-all">
                ▶ Iniciar Treino
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};