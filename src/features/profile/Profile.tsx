import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { useEffect } from 'react';
import { User, Mail, ShieldCheck, Dumbbell, CalendarCheck, Flame, Pencil, Check, X } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ workouts: 0, checkins: 0, streak: 0 });

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    const [workouts, checkins] = await Promise.all([
      getUserWorkouts(user!.uid),
      getUserCheckins(user!.uid),
    ]);
    setStats({
      workouts: workouts.length,
      checkins: checkins.length,
      streak: getStreak(checkins),
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    await updateProfile(auth.currentUser, { displayName });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Minha conta</p>
        <h1 className="text-4xl font-black text-white leading-none">Perfil</h1>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center text-2xl font-black text-black">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{firstName}</h2>
          <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
          {saved && (
            <p className="text-green-400 text-xs mt-1 font-semibold">Perfil atualizado!</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Treinos', value: stats.workouts.toString(), icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Check-ins', value: stats.checkins.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Sequencia', value: `${stats.streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#111] rounded-2xl p-4 border border-white/5 text-center">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Informacoes */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
          Informacoes pessoais
        </p>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <User size={12} />
              Nome
            </label>
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-green-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">
                {user?.displayName || '—'}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <Mail size={12} />
              Email
            </label>
            <p className="text-white/50 text-sm py-3 px-4 bg-white/5 rounded-xl">
              {user?.email}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <ShieldCheck size={12} />
              Email verificado
            </label>
            <p className="text-sm py-3 px-4 bg-white/5 rounded-xl">
              {user?.emailVerified ? (
                <span className="text-green-400 font-semibold">Verificado</span>
              ) : (
                <span className="text-yellow-400 font-semibold">Nao verificado</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Botoes */}
      {editing ? (
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-3.5 rounded-xl transition-all"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-bold py-3.5 rounded-xl transition-all"
          >
            <Check size={16} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-3.5 rounded-xl transition-all border border-white/5"
        >
          <Pencil size={16} />
          Editar perfil
        </button>
      )}
    </motion.div>
  );
};