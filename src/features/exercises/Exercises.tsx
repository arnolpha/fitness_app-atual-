import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import {
  createExercise,
  getUserExercises,
  deleteExercise,
  Exercise,
} from '../../services/exerciseService';

const categories = ['Todos', 'Peito', 'Costas', 'Ombro', 'Biceps', 'Triceps', 'Perna', 'Abdomen', 'Cardio'];
const difficulties = ['Iniciante', 'Intermediario', 'Avancado'];
const equipments = ['Barra', 'Halteres', 'Polia', 'Maquina', 'Nenhum', 'Esteira', 'Outro'];

const difficultyColor: Record<string, string> = {
  'Iniciante': 'text-green-400 bg-green-400/10',
  'Intermediario': 'text-yellow-400 bg-yellow-400/10',
  'Avancado': 'text-red-400 bg-red-400/10',
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
    await createExercise({ ...form, userId: user.uid });
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
    const matchCategory = activeCategory === 'Todos' || ex.category === activeCategory;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Exercicios</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} exercicios encontrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          {showForm ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#111] border border-indigo-500/30 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                Novo Exercicio
              </h2>

              <div>
                <label className="block text-xs text-white/40 mb-2">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Supino Reto"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">Musculo</label>
                <input
                  type="text"
                  value={form.muscle}
                  onChange={(e) => setForm({ ...form, muscle: e.target.value })}
                  placeholder="Ex: Peitoral maior"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none"
                >
                  {categories.filter(c => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">Dificuldade</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">Equipamento</label>
                <select
                  value={form.equipment}
                  onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none"
                >
                  {equipments.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {saving ? 'Salvando...' : 'Criar Exercicio'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="text"
        placeholder="Buscar exercicio..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 outline-none mb-4"
      />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#111] border border-white/5 rounded-xl p-4 animate-pulse h-24"
            />
          ))}
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-white/30">
          <p className="text-4xl mb-3">💪</p>
          <p className="text-sm">Nenhum exercicio cadastrado ainda</p>
          <p className="text-xs mt-1">Clique em + Novo para comecar</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111] border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{ex.name}</h3>
                  <p className="text-white/40 text-xs mt-1">
                    {ex.muscle} - {ex.equipment}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor[ex.difficulty]}`}
                >
                  {ex.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded-full">
                  {ex.category}
                </span>
                <button
                  onClick={() => handleDelete(ex.id!)}
                  className="text-red-400/50 hover:text-red-400 text-xs transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};