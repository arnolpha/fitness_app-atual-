import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Dumbbell, BookOpen, X } from 'lucide-react';
import { useExercises } from './hooks/useExercises';
import { Button, Card, Badge, SectionHeader, EmptyState, Skeleton, Input } from '../../components/ui';
import { exerciseLibrary, LibraryExercise } from '../../constants/exercises';

const categories = ['Todos', 'Peito', 'Costas', 'Ombro', 'Biceps', 'Triceps', 'Perna', 'Abdomen', 'Cardio'];
const difficulties = ['Iniciante', 'Intermediario', 'Avancado'];
const equipments = ['Barra', 'Halteres', 'Polia', 'Maquina', 'Nenhum', 'Esteira', 'Outro'];

const difficultyVariant: Record<string, 'green' | 'yellow' | 'red'> = {
  'Iniciante': 'green',
  'Intermediario': 'yellow',
  'Avancado': 'red',
};

export const Exercises = () => {
  const { exercises, loading, saving, create, remove } = useExercises();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('Todos');
  const [librarySearch, setLibrarySearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Peito',
    muscle: '',
    difficulty: 'Iniciante',
    equipment: 'Nenhum',
  });

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await create(form);
    setForm({ name: '', category: 'Peito', muscle: '', difficulty: 'Iniciante', equipment: 'Nenhum' });
    setShowForm(false);
  };

  const handleAddFromLibrary = async (ex: LibraryExercise) => {
    const alreadyAdded = exercises.some((e) => e.name === ex.name);
    if (alreadyAdded) return;
    setAdding(ex.name);
    await create(ex);
    setAdding(null);
  };

  const filtered = exercises.filter((ex) => {
    const matchCategory = activeCategory === 'Todos' || ex.category === activeCategory;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredLibrary = exerciseLibrary.filter((ex) => {
    const matchCategory = libraryCategory === 'Todos' || ex.category === libraryCategory;
    const matchSearch = ex.name.toLowerCase().includes(librarySearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Biblioteca</p>
          <h1 className="text-4xl font-black text-white leading-none">Exercicios</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { setShowLibrary(!showLibrary); setShowForm(false); }}
            variant={showLibrary ? 'secondary' : 'secondary'}
            size="md"
          >
            <BookOpen size={16} />
            {showLibrary ? 'Fechar' : 'Biblioteca'}
          </Button>
          <Button
            onClick={() => { setShowForm(!showForm); setShowLibrary(false); }}
            variant={showForm ? 'secondary' : 'primary'}
            size="md"
          >
            <Plus size={16} />
            {showForm ? 'Cancelar' : 'Novo'}
          </Button>
        </div>
      </div>

      {/* Formulario de novo exercicio */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-green-500/20 space-y-4">
              <p className="text-sm font-bold text-white uppercase tracking-widest">Novo Exercicio</p>

              <Input
                label="Nome"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Ex: Supino Reto"
              />

              <Input
                label="Musculo"
                value={form.muscle}
                onChange={(v) => setForm({ ...form, muscle: v })}
                placeholder="Ex: Peitoral maior"
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                  >
                    {categories.filter(c => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Dificuldade</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Equipamento</label>
                  <select
                    value={form.equipment}
                    onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                  >
                    {equipments.map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!form.name.trim()}
                loading={saving}
                fullWidth
              >
                Criar Exercicio
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biblioteca de exercicios */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white uppercase tracking-widest">
                  Biblioteca — {filteredLibrary.length} exercicios
                </p>
                <button onClick={() => setShowLibrary(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <Input
                value={librarySearch}
                onChange={setLibrarySearch}
                placeholder="Buscar na biblioteca..."
                icon={<Search size={16} />}
                className="mb-4"
              />

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryCategory(cat)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                      libraryCategory === cat
                        ? 'bg-green-500 text-black'
                        : 'bg-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {filteredLibrary.map((ex) => {
                  const alreadyAdded = exercises.some((e) => e.name === ex.name);
                  return (
                    <div
                      key={ex.name}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        alreadyAdded
                          ? 'border-green-500/20 bg-green-500/5'
                          : 'border-white/5 bg-white/5 hover:border-green-500/20'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{ex.name}</p>
                        <p className="text-white/30 text-xs mt-0.5">{ex.muscle} · {ex.equipment}</p>
                      </div>
                      <button
                        onClick={() => handleAddFromLibrary(ex)}
                        disabled={alreadyAdded || adding === ex.name}
                        className={`ml-3 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          alreadyAdded
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-green-500 hover:bg-green-400 text-black'
                        }`}
                      >
                        {alreadyAdded ? '✓' : adding === ex.name ? '...' : <Plus size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Busca */}
      <Input
        value={search}
        onChange={setSearch}
        placeholder="Buscar exercicio..."
        icon={<Search size={16} />}
        className="mb-4"
      />

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
              activeCategory === cat
                ? 'bg-green-500 text-black'
                : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <Skeleton className="h-24" count={4} />}

      {/* Empty */}
      {!loading && exercises.length === 0 && (
        <EmptyState
          icon={<Dumbbell size={40} />}
          title="Nenhum exercicio ainda"
          description="Use a Biblioteca ou clique em Novo para comecar"
        />
      )}

      {/* Lista */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{ex.name}</h3>
                    <p className="text-white/40 text-xs mt-1">{ex.muscle} · {ex.equipment}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge label={ex.difficulty} variant={difficultyVariant[ex.difficulty]} />
                    <button
                      onClick={() => remove(ex.id!)}
                      className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge label={ex.category} variant="gray" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};