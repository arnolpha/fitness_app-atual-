import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { saveProfile, getProfile, UserProfile } from '../../services/profileService';
import {
  User, Mail, ShieldCheck, Dumbbell, CalendarCheck,
  Flame, Pencil, Check, X, MapPin, Scale, Ruler, Calendar,
} from 'lucide-react';
import { Card, SectionHeader, Button, Input } from '../../components/ui';

const sexOptions = ['Masculino', 'Feminino', 'Prefiro nao informar'];
const brazilStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const Profile = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ workouts: 0, checkins: 0, streak: 0 });
  const [form, setForm] = useState<UserProfile>({
    userId: user?.uid || '',
    displayName: user?.displayName || '',
    sex: '',
    birthDate: '',
    height: undefined,
    weight: undefined,
    city: '',
    state: '',
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [workouts, checkins, profile] = await Promise.all([
      getUserWorkouts(user!.uid),
      getUserCheckins(user!.uid),
      getProfile(user!.uid),
    ]);
    setStats({
      workouts: workouts.length,
      checkins: checkins.length,
      streak: getStreak(checkins),
    });
    if (profile) setForm((prev) => ({ ...prev, ...profile }));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    await updateProfile(auth.currentUser, { displayName: form.displayName });
    await saveProfile({ ...form, userId: user!.uid });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';
  const age = form.birthDate ? getAge(form.birthDate) : null;

  const statCards = [
    { label: 'Treinos', value: stats.workouts.toString(), icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Check-ins', value: stats.checkins.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Sequencia', value: `${stats.streak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <SectionHeader title="Perfil" subtitle="Minha conta" />

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-2xl font-black text-black">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{firstName}</h2>
          <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-3 mt-1">
            {form.city && (
              <span className="text-white/30 text-xs flex items-center gap-1">
                <MapPin size={10} />
                {form.city}{form.state ? `, ${form.state}` : ''}
              </span>
            )}
            {age && <span className="text-white/30 text-xs">{age} anos</span>}
          </div>
          {saved && <p className="text-green-400 text-xs mt-1 font-semibold">Perfil atualizado!</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Informacoes */}
      <Card className="mb-4 space-y-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
          Informacoes pessoais
        </p>

        {/* Nome */}
        {editing ? (
          <Input
            label="Nome"
            value={form.displayName || ''}
            onChange={(v) => setForm({ ...form, displayName: v })}
            icon={<User size={14} />}
          />
        ) : (
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <User size={12} /> Nome
            </label>
            <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">{form.displayName || '—'}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
            <Mail size={12} /> Email
          </label>
          <p className="text-white/50 text-sm py-3 px-4 bg-white/5 rounded-xl">{user?.email}</p>
        </div>

        {/* Email verificado */}
        <div>
          <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
            <ShieldCheck size={12} /> Email verificado
          </label>
          <p className="text-sm py-3 px-4 bg-white/5 rounded-xl">
            {user?.emailVerified
              ? <span className="text-green-400 font-semibold">Verificado</span>
              : <span className="text-yellow-400 font-semibold">Nao verificado</span>}
          </p>
        </div>

        {/* Sexo */}
        <div>
          <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
            <User size={12} /> Sexo
          </label>
          {editing ? (
            <select
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">Selecionar</option>
              {sexOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">{form.sex || '—'}</p>
          )}
        </div>

        {/* Data de nascimento */}
        <div>
          <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
            <Calendar size={12} /> Data de nascimento
          </label>
          {editing ? (
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
            />
          ) : (
            <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">
              {form.birthDate
                ? `${new Date(form.birthDate).toLocaleDateString('pt-BR')} ${age ? `(${age} anos)` : ''}`
                : '—'}
            </p>
          )}
        </div>

        {/* Altura e Peso */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <Ruler size={12} /> Altura (cm)
            </label>
            {editing ? (
              <input
                type="number"
                value={form.height || ''}
                onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                placeholder="175"
                className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">
                {form.height ? `${form.height} cm` : '—'}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <Scale size={12} /> Peso (kg)
            </label>
            {editing ? (
              <input
                type="number"
                value={form.weight || ''}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                placeholder="70"
                className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">
                {form.weight ? `${form.weight} kg` : '—'}
              </p>
            )}
          </div>
        </div>

        {/* Localizacao */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <MapPin size={12} /> Cidade
            </label>
            {editing ? (
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Sao Paulo"
                className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">{form.city || '—'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-medium mb-2">
              <MapPin size={12} /> Estado
            </label>
            {editing ? (
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-background border border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">UF</option>
                {brazilStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <p className="text-white text-sm py-3 px-4 bg-white/5 rounded-xl">{form.state || '—'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Botoes */}
      {editing ? (
        <div className="flex gap-3">
          <Button onClick={() => setEditing(false)} variant="secondary" fullWidth>
            <X size={16} /> Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving} fullWidth>
            <Check size={16} />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      ) : (
        <Button onClick={() => setEditing(true)} variant="secondary" fullWidth>
          <Pencil size={16} /> Editar perfil
        </Button>
      )}
    </motion.div>
  );
};