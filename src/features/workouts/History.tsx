import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserSessions, WorkoutSession } from '../../services/sessionService';
import { Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, SectionHeader, EmptyState, Skeleton } from '../../components/ui';

export const History = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await getUserSessions(user!.uid);
    setSessions(data.reverse());
    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return '—';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalVolume = (session: WorkoutSession) => {
    return session.series.reduce((acc, serie) => {
      return acc + serie.sets.reduce((setAcc, set) => setAcc + set.weight * set.reps, 0);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SectionHeader title="Histórico" subtitle="Treinos realizados" />

      {/* Stats rapidos */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-3xl font-black text-white">{sessions.length}</p>
          <p className="text-white/40 text-xs font-medium mt-1">Treinos realizados</p>
        </Card>
        <Card>
          <p className="text-3xl font-black text-white">
            {sessions.reduce((acc, s) => acc + s.series.length, 0)}
          </p>
          <p className="text-white/40 text-xs font-medium mt-1">Series totais</p>
        </Card>
      </div>

      {/* Loading */}
      {loading && <Skeleton className="h-24" count={4} />}

      {/* Empty */}
      {!loading && sessions.length === 0 && (
        <EmptyState
          icon={<Dumbbell size={40} />}
          title="Nenhum treino realizado ainda"
          description="Inicie um treino para ver o histórico"
        />
      )}

      {/* Lista */}
      {!loading && (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover onClick={() => setExpanded(expanded === session.id ? null : session.id!)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white truncate">{session.workoutName}</h3>
                    <p className="text-white/30 text-xs mt-1">{formatDate(session.createdAt)}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-green-400" />
                        <span className="text-white/50 text-xs font-semibold">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Dumbbell size={12} className="text-blue-400" />
                        <span className="text-white/50 text-xs font-semibold">
                          {session.series.length} exercícios
                        </span>
                      </div>
                      {totalVolume(session) > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/50 text-xs font-semibold">
                            {totalVolume(session).toLocaleString()} kg vol.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-white/30 ml-3">
                    {expanded === session.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expanded === session.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/5 space-y-3"
                  >
                    {session.series.map((serie, idx) => (
                      <div key={idx}>
                        <p className="text-white text-sm font-bold mb-2">{serie.exerciseName}</p>
                        <div className="space-y-1">
                          {serie.sets.map((set, si) => (
                            <div key={si} className="flex items-center gap-3 text-xs text-white/40">
                              <span className="w-12">Serie {si + 1}</span>
                              <span className="bg-white/5 px-2 py-1 rounded-lg">
                                {set.weight} kg
                              </span>
                              <span className="bg-white/5 px-2 py-1 rounded-lg">
                                {set.reps} reps
                              </span>
                              {set.weight > 0 && set.reps > 0 && (
                                <span className="text-white/20">
                                  = {set.weight * set.reps} kg vol.
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};