import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  createExercise,
  getUserExercises,
  deleteExercise,
  Exercise,
} from '../../services/exerciseService';
import { Plus, Search, Trash2, Dumbbell } from 'lucide-react';

const categories = ['Todos', 'Peito', 'Costas', 'Ombro', 'Biceps', 'Triceps', 'Perna', 'Abdomen', 'Cardio'];
const difficulties = ['Iniciante', 'Intermediario', 'Avancado'];
const equipments = ['Barra', 'Halteres', 'Polia', 'Maquina', 'Nenhum', 'Esteira', 'Outro'];

const difficultyColor: Record<string, string> = {
  Iniciante: 'text-green-400 bg-green-400/10',
  Intermediario: 'text-yellow-400 bg-yellow-400/10',
  Avancado: 'text-red-400 bg-red-400/10',
};

export const Exercises = () => {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Peito',
    muscle: '',
    difficulty: 'Iniciante',
    equipment: 'Nenhum',
  });

  useEffect(() => {
    if (!user) return;
    loadExercises();
  }, [user]);

  const loadExercises = async () => {
    setLoading(true);
    const data = await getUserExercises(user!.uid);
    setExercises(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !user) return;

    setSaving(true);

    await createExercise({
      ...form,
      userId: user.uid,
    });

    setForm({
      name: '',
      category: 'Peito',
      muscle: '',
      difficulty: 'Iniciante',
      equipment: 'Nenhum',
    });

    setShowForm(false);
    setSaving(false);

    await loadExercises();
  };

  const handleDelete = async (id: string) => {
    await deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = exercises.filter((ex) => {
    const matchCategory =
      activeCategory === 'Todos' || ex.category === activeCategory;

    const matchSearch =
      ex.name.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

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
            Biblioteca
          </p>

          <h1 className="text-4xl font-black text-white leading-none">
            Exercícios
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
                Novo exercício
              </h2>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Nome do exercício"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition"
              />

              <input
                value={form.muscle}
                onChange={(e) =>
                  setForm({ ...form, muscle: e.target.value })
                }
                placeholder="Músculo principal"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition"
              />

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                >
                  {categories.filter((c) => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value })
                  }
                  className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={form.equipment}
                  onChange={(e) =>
                    setForm({ ...form, equipment: e.target.value })
                  }
                  className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                >
                  {equipments.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || saving}
                className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-xl transition"
              >
                {saving ? 'Salvando...' : 'Criar exercício'}
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
          placeholder="Buscar exercício..."
          className="w-full bg-[#111] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none"
        />
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
              activeCategory === cat
                ? 'bg-green-500 text-black'
                : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
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
      {!loading && exercises.length === 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-10 flex flex-col items-center text-center text-white/30">
          <Dumbbell size={42} className="mb-3 text-white/20" />
          <p className="text-sm font-semibold text-white/40">
            Nenhum exercício ainda
          </p>
          <p className="text-xs mt-1 text-white/20">
            Crie seu primeiro exercício para começar
          </p>
        </div>
      )}

      {/* LIST */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-green-500/20 hover:-translate-y-0.5 transition group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{ex.name}</h3>
                  <p className="text-xs text-white/40 mt-1">
                    {ex.muscle} · {ex.equipment}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-bold ${
                      difficultyColor[ex.difficulty]
                    }`}
                  >
                    {ex.difficulty}
                  </span>

                  <button
                    onClick={() => handleDelete(ex.id!)}
                    className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs bg-white/5 text-white/40 px-2 py-1 rounded-lg">
                  {ex.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};