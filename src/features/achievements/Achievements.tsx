import { memo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { getAchievements } from '../../services/achievementService';
import { ACHIEVEMENTS, AchievementDefinition } from '../../types/achievements';
import { SectionHeader, Card } from '../../components/ui';
import { Lock } from 'lucide-react';

const CATEGORIES = ['treino', 'checkin', 'sequência', 'meta'] as const;
const CATEGORY_LABELS = {
  treino: 'Treinos',
  checkin: 'Check-ins',
  sequência: 'Sequências',
  meta: 'Metas Semanais',
};

const AchievementCard = memo(({
  achievement,
  unlocked,
  unlockedAt,
}: {
  achievement: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: string;
}) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
    unlocked
      ? 'bg-white/5 border-white/10'
      : 'bg-white/[0.02] border-white/5 opacity-50'
  }`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
      unlocked ? 'bg-green-500/10' : 'bg-white/5'
    }`}>
      {unlocked ? achievement.emoji : <Lock size={16} className="text-white/20" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-white/40'}`}>
        {achievement.title}
      </p>
      <p className="text-white/30 text-xs mt-0.5">{achievement.description}</p>
      {unlocked && unlockedAt && (
        <p className="text-green-400/60 text-xs mt-1">
          Desbloqueado em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
    {unlocked && (
      <div className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
    )}
  </div>
));
AchievementCard.displayName = 'AchievementCard';

export const Achievements = () => {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', user?.uid],
    queryFn: () => getAchievements(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5,
  });

  const unlockedMap = new Map(
    (data?.unlocked ?? []).map((a) => [a.id, a.unlockedAt])
  );
  const totalUnlocked = unlockedMap.size;
  const total = ACHIEVEMENTS.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <SectionHeader title="Conquistas" subtitle={`${totalUnlocked} de ${total} desbloqueadas`} />

      {/* Progresso geral */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Progresso</p>
          <p className="text-white font-black">{totalUnlocked}/{total}</p>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalUnlocked / total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-white/20 text-xs mt-2">
          {Math.round((totalUnlocked / total) * 100)}% completo
        </p>
      </Card>

      {/* Por categoria */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        CATEGORIES.map((category) => {
          const items = ACHIEVEMENTS.filter((a) => a.category === category);
          const unlockedCount = items.filter((a) => unlockedMap.has(a.id)).length;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
                  {CATEGORY_LABELS[category]}
                </p>
                <p className="text-white/30 text-xs">{unlockedCount}/{items.length}</p>
              </div>
              {items.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlockedMap.has(achievement.id)}
                  unlockedAt={unlockedMap.get(achievement.id)}
                />
              ))}
            </div>
          );
        })
      )}
    </motion.div>
  );
};