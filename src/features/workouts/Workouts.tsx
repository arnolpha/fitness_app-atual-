import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  createWorkout,
  getUserWorkouts,
  deleteWorkout,
  Workout,
} from '../../services/workoutService';
import { WorkoutSession } from './WorkoutSession';
import { Plus, Trash2, Play, ClipboardList } from 'lucide-react';

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const Workouts = () => {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeSession, setActiveSession] = useState<Workout | null>(null);
  const [finished, setFinished] = useState(false);

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
      duration: '0',
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

  const handleFinish = () => {
    setActiveSession(null);
    setFinished(true);
    setTimeout(() => setFinished(false), 3000);
  };

  if (activeSession) {
    return (
      <WorkoutSession
        workout={activeSession}
        onFinish={handleFinish}
        onCancel={() => setActiveSession(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Meus treinos</p>
          <h1 className="text-4xl font-black text-white leading-none">Treinos</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            showForm
              ? 'bg-white/10 text-white'
              : 'bg-green-500 hover:bg-green-400 text-black'
          }`}
        >
          <Plus size={16} />
          {showForm ? 'Cancelar' : 'Novo'}
        </button>
      </div>

      {/* Mensagem de sucesso */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6"
          >
            <p className="text-green-400 font-semibold text-sm">
              Treino finalizado e salvo!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Novo Treino
              </h2>

              <div>
                <label className="block text-xs text-white/40 font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ex: Treino A - Peito"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 font-medium mb-2">Dias da semana</label>
                <div className="flex gap-2 flex-wrap">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedDays.includes(day)
                          ? 'bg-green-500 text-black'
                          : 'bg-white/5 text-white/40 hover:text-white'
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
                className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-xl transition-all"
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
            <div key={i} className="bg-[#111] rounded-2xl p-5 animate-pulse h-32" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && workouts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-white/20">
          <ClipboardList size={40} className="mb-3" />
          <p className="text-sm font-semibold">Nenhum treino cadastrado</p>
          <p className="text-xs mt-1">Clique em Novo para comecar</p>
        </div>
      )}

      {/* Lista */}
      {!loading && (
        <div className="space-y-3">
          {workouts.map((workout, i) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-green-500/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-lg truncate">{workout.name}</h3>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {daysOfWeek.map((day) => (
                      <span
                        key={day}
                        className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                          workout.days.includes(day)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/5 text-white/15'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(workout.id!)}
                  className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <button
                onClick={() => setActiveSession(workout)}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-all text-sm"
              >
                <Play size={16} />
                Iniciar Treino
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};