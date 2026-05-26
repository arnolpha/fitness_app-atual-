import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export const Profile = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">Perfil 👤</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white mb-3">
          {initials}
        </div>
        <p className="text-white/40 text-sm">{user?.email}</p>
        {saved && (
          <p className="text-green-400 text-xs mt-2">✅ Perfil atualizado!</p>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Informações pessoais
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nome</label>
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-indigo-500/50 rounded-lg px-4 py-3 text-sm text-white outline-none"
              />
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-lg">
                {user?.displayName || '—'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Email</label>
            <p className="text-white/60 text-sm py-3 px-4 bg-white/5 rounded-lg">
              {user?.email}
            </p>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">
              E-mail verificado
            </label>
            <p className="text-sm py-3 px-4 bg-white/5 rounded-lg">
              {user?.emailVerified ? (
                <span className="text-green-400">✅ Verificado</span>
              ) : (
                <span className="text-yellow-400">⚠️ Não verificado</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-6">
        <h2 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Estatísticas
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Treinos', value: '0' },
            { label: 'Check-ins', value: '0' },
            { label: 'Sequência', value: '0d' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botões */}
      {editing ? (
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold py-3 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-lg transition-all"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-lg transition-all"
        >
          ✏️ Editar perfil
        </button>
      )}
    </motion.div>
  );
};