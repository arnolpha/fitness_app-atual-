import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = [
  'Todos', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Perna', 'Abdômen', 'Cardio'
];

const mockExercises = [
  { id: '1', name: 'Supino Reto', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Intermediário', equipment: 'Barra' },
  { id: '2', name: 'Puxada Frontal', category: 'Costas', muscle: 'Latíssimo do dorso', difficulty: 'Intermediário', equipment: 'Polia' },
  { id: '3', name: 'Desenvolvimento', category: 'Ombro', muscle: 'Deltoide', difficulty: 'Intermediário', equipment: 'Halteres' },
  { id: '4', name: 'Rosca Direta', category: 'Bíceps', muscle: 'Bíceps braquial', difficulty: 'Iniciante', equipment: 'Barra' },
  { id: '5', name: 'Tríceps Corda', category: 'Tríceps', muscle: 'Tríceps braquial', difficulty: 'Iniciante', equipment: 'Polia' },
  { id: '6', name: 'Agachamento', category: 'Perna', muscle: 'Quadríceps', difficulty: 'Intermediário', equipment: 'Barra' },
  { id: '7', name: 'Prancha', category: 'Abdômen', muscle: 'Core', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { id: '8', name: 'Corrida', category: 'Cardio', muscle: 'Full body', difficulty: 'Iniciante', equipment: 'Esteira' },
  { id: '9', name: 'Supino Inclinado', category: 'Peito', muscle: 'Peitoral superior', difficulty: 'Intermediário', equipment: 'Halteres' },
  { id: '10', name: 'Remada Curvada', category: 'Costas', muscle: 'Trapézio', difficulty: 'Avançado', equipment: 'Barra' },
  { id: '11', name: 'Leg Press', category: 'Perna', muscle: 'Quadríceps', difficulty: 'Iniciante', equipment: 'Máquina' },
  { id: '12', name: 'Abdominal', category: 'Abdômen', muscle: 'Reto abdominal', difficulty: 'Iniciante', equipment: 'Nenhum' },
];

const difficultyColor: Record<string, string> = {
  'Iniciante': 'text-green-400 bg-green-400/10',
  'Intermediário': 'text-yellow-400 bg-yellow-400/10',
  'Avançado': 'text-red-400 bg-red-400/10',
};

export const Exercises = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = mockExercises.filter((ex) => {
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
          <h1 className="text-2xl font-bold">Exercícios 💪</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} exercícios encontrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          + Novo
        </button>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar exercício..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 outline-none mb-4"
      />

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
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

      {/* Lista */}
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
                <p className="text-white/40 text-xs mt-1">{ex.muscle} · {ex.equipment}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor[ex.difficulty]}`}>
                {ex.difficulty}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded-full">
                {ex.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};