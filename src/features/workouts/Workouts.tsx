import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getUserWorkouts,
  createWorkout,
  deleteWorkout,
  Workout,
} from '../../services/workoutService';
import { Plus, Search, Trash2, Dumbbell } from 'lucide-react';

const focusOptions = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Cardio'];

export const Workouts = () => {
  const { user } = useAuthStore();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    focus: 'Push',
  });

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

  const handleCreate = async () => {
    if (!form.name.trim() || !user) return;

    setSaving(true);

    await createWorkout({
      ...form,
      userId: user.uid,
      exercises: [],
      createdAt: Date.now(),
    });

    setForm({ name: '', focus: 'Push' });
    setShowForm(false);
    setSaving(false);

    await loadWorkouts();
  };

  const handleDelete = async (id: string) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
            Planejamento
          </p>

          <h1 className="text-4xl font-black text-white leading-none">
            Treinos
          </h1>
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

      {/* FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
                Novo treino
              </h2>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Nome do treino (ex: Push A)"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition"
              />

              <select
                value={form.focus}
                onChange={(e) =>
                  setForm({ ...form, focus: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
              >
                {focusOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || saving}
                className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-xl transition"
              >
                {saving ? 'Salvando...' : 'Criar treino'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar treino..."
          className="w-full bg-[#111] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#111] border border-white/5 rounded-2xl p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && workouts.length === 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-10 flex flex-col items-center text-center text-white/30">
          <Dumbbell size={42} className="mb-3 text-white/20" />
          <p className="text-sm font-semibold text-white/40">
            Nenhum treino criado
          </p>
          <p className="text-xs mt-1 text-white/20">
            Crie sua rotina para começar seu planejamento
          </p>
        </div>
      )}

      {/* LIST */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-green-500/20 hover:-translate-y-0.5 transition group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{w.name}</h3>

                  <p className="text-xs text-white/40 mt-1">
                    Foco: {w.focus}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(w.id!)}
                  className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs bg-white/5 text-white/40 px-2 py-1 rounded-lg">
                  {w.exercises?.length || 0} exercícios
                </span>

                <span className="text-xs text-white/30">
                  {w.createdAt
                    ? new Date(w.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};