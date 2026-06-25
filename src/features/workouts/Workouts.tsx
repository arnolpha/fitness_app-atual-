import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, ClipboardList, ChevronDown, Check } from 'lucide-react';
import { useWorkouts } from './hooks/useWorkouts';
import { getUserExercises, Exercise } from '../../services/exerciseService';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutSession } from './WorkoutSession';
import { Button, Card, EmptyState, Skeleton } from '../../components/ui';

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const Workouts = () => {
  const { user } = useAuthStore();
  const { workouts, loading, saving, create, remove } = useWorkouts();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExPicker, setShowExPicker] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserExercises(user.uid).then(setExercises);
  }, [user]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleExercise = (ex: Exercise) => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === ex.id)
        ? prev.filter((e) => e.id !== ex.id)
        : [...prev, ex]
    );
  };

  const handleCreate = async () => {
    if (!workoutName.trim()) return;
    await create({
      name: workoutName,
      days: selectedDays,
      exercises: selectedExercises.map((e) => e.id!),
      exerciseNames: selectedExercises.map((e) => e.name),
      duration: '0',
    });
    setWorkoutName('');
    setSelectedDays([]);
    setSelectedExercises([]);
    setShowForm(false);
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
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Meus treinos</p>
          <h1 className="text-4xl font-black text-white leading-none">Treinos</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          size="md"
        >
          <Plus size={16} />
          {showForm ? 'Cancelar' : 'Novo'}
        </Button>
      </div>

      {/* Sucesso */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6"
          >
            <p className="text-green-400 font-semibold text-sm">Treino finalizado e salvo!</p>
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
            <Card className="border-primary/20 space-y-4">
              <p className="text-sm font-bold text-white uppercase tracking-widest">Novo Treino</p>

              <div>
                <label className="block text-xs text-white/40 font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ex: Treino A - Peito"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors"
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
                          ? 'bg-primary text-black'
                          : 'bg-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 font-medium mb-2">
                  Exercícios ({selectedExercises.length} selecionados)
                </label>
                <button
                  onClick={() => setShowExPicker(!showExPicker)}
                  className="w-full flex items-center justify-between bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <span>Selecionar exercícios</span>
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showExPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-background border border-white/5 rounded-xl mt-2 max-h-48 overflow-y-auto">
                        {exercises.length === 0 ? (
                          <p className="text-white/30 text-xs text-center py-6">
                            Nenhum exercício cadastrado.
                          </p>
                        ) : (
                          exercises.map((ex) => {
                            const selected = selectedExercises.find((e) => e.id === ex.id);
                            return (
                              <button
                                key={ex.id}
                                onClick={() => toggleExercise(ex)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                              >
                                <div className="text-left">
                                  <p className="text-white text-sm font-semibold">{ex.name}</p>
                                  <p className="text-white/30 text-xs">{ex.category}</p>
                                </div>
                                {selected && <Check size={16} className="text-green-400 shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedExercises.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedExercises.map((ex) => (
                      <span key={ex.id} className="text-xs bg-green-500/10 text-green-400 px-2.5 py-1 rounded-lg font-semibold">
                        {ex.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreate}
                disabled={!workoutName.trim()}
                loading={saving}
                fullWidth
              >
                Criar Treino
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && <Skeleton className="h-32" count={3} />}

      {/* Empty */}
      {!loading && workouts.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="Nenhum treino cadastrado"
          description="Clique em Novo para comecar"
        />
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
            >
              <Card hover>
                <div className="flex items-start justify-between gap-4 mb-3">
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
                    {workout.exerciseNames && workout.exerciseNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {workout.exerciseNames.map((name, idx) => (
                          <span key={idx} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-lg">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(workout.id!)}
                    className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <Button onClick={() => setActiveSession(workout)} fullWidth>
                  <Play size={16} />
                  Iniciar Treino
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};