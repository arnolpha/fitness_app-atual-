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
  Flame, Pencil, Check, X, MapPin, Scale, Ruler, Calendar
} from 'lucide-react';
import { Card, SectionHeader, Button, Input } from '../../components/ui';

/* ---------------- UI PATTERN BASE ---------------- */

const Field = ({ label, icon, children }: any) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-xs text-white/40 font-medium">
      {icon} {label}
    </label>
    <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white">
      {children}
    </div>
  </div>
);

const FieldInput = (props: any) => (
  <input
    {...props}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
  />
);

/* ---------------- MAIN ---------------- */

export const Profile = () => {
  const { user } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [stats, setStats] = useState({
    workouts: 0,
    checkins: 0,
    streak: 0,
  });

  const [form, setForm] = useState<UserProfile>({
    userId: user?.uid || '',
    displayName: '',
    sex: '',
    birthDate: '',
    height: undefined,
    weight: undefined,
    city: '',
    state: '',
  });

  /* ---------------- LOAD ---------------- */

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

    if (profile) setForm(profile);
  };

  /* ---------------- LOGIC ---------------- */

  const getAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const bmi =
    form.height && form.weight
      ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
      : null;

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);

      await updateProfile(auth.currentUser, {
        displayName: form.displayName,
      });

      await saveProfile({ ...form, userId: user!.uid });

      setSaved(true);
      setEditing(false);

      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI HELPERS ---------------- */

  const initials =
    (user?.displayName || user?.email || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Atleta';

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <SectionHeader title="Perfil" subtitle="Minha conta" />

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-black font-black text-lg">
          {initials}
        </div>

        <div>
          <p className="text-white font-bold">{firstName}</p>
          <p className="text-white/40 text-sm">{user?.email}</p>

          {saved && (
            <p className="text-green-400 text-xs mt-1">
              Perfil atualizado
            </p>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xl font-black">{stats.workouts}</p>
          <p className="text-xs text-white/40">Treinos</p>
        </Card>

        <Card className="text-center">
          <p className="text-xl font-black">{stats.checkins}</p>
          <p className="text-xs text-white/40">Check-ins</p>
        </Card>

        <Card className="text-center">
          <p className="text-xl font-black">{stats.streak}d</p>
          <p className="text-xs text-white/40">Sequência</p>
        </Card>
      </div>

      {/* IMC */}
      {bmi && (
        <Card>
          <p className="text-white text-sm">
            IMC: <span className="font-bold">{bmi}</span>
          </p>
        </Card>
      )}

      {/* PROFILE FIELDS */}
      <Card className="space-y-4">

        {editing ? (
          <Field label="Nome" icon={<User size={12} />}>
            <FieldInput
              value={form.displayName || ''}
              onChange={(e: any) =>
                setForm({ ...form, displayName: e.target.value })
              }
            />
          </Field>
        ) : (
          <Field label="Nome" icon={<User size={12} />}>
            {form.displayName || '—'}
          </Field>
        )}

        <Field label="Email" icon={<Mail size={12} />}>
          {user?.email}
        </Field>

        <Field label="Sexo" icon={<User size={12} />}>
          {editing ? (
            <FieldInput
              value={form.sex || ''}
              onChange={(e: any) =>
                setForm({ ...form, sex: e.target.value })
              }
            />
          ) : (
            form.sex || '—'
          )}
        </Field>

        <Field label="Nascimento" icon={<Calendar size={12} />}>
          {editing ? (
            <FieldInput
              type="date"
              value={form.birthDate || ''}
              onChange={(e: any) =>
                setForm({ ...form, birthDate: e.target.value })
              }
            />
          ) : (
            form.birthDate || '—'
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Altura" icon={<Ruler size={12} />}>
            {editing ? (
              <FieldInput
                type="number"
                value={form.height || ''}
                onChange={(e: any) =>
                  setForm({ ...form, height: Number(e.target.value) })
                }
              />
            ) : (
              `${form.height || '—'} cm`
            )}
          </Field>

          <Field label="Peso" icon={<Scale size={12} />}>
            {editing ? (
              <FieldInput
                type="number"
                value={form.weight || ''}
                onChange={(e: any) =>
                  setForm({ ...form, weight: Number(e.target.value) })
                }
              />
            ) : (
              `${form.weight || '—'} kg`
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade" icon={<MapPin size={12} />}>
            {editing ? (
              <FieldInput
                value={form.city || ''}
                onChange={(e: any) =>
                  setForm({ ...form, city: e.target.value })
                }
              />
            ) : (
              form.city || '—'
            )}
          </Field>

          <Field label="Estado" icon={<MapPin size={12} />}>
            {editing ? (
              <FieldInput
                value={form.state || ''}
                onChange={(e: any) =>
                  setForm({ ...form, state: e.target.value })
                }
              />
            ) : (
              form.state || '—'
            )}
          </Field>
        </div>
      </Card>

      {/* ACTIONS */}
      <div className="flex gap-3">
        {editing ? (
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setEditing(false)}
            >
              <X size={16} /> Cancelar
            </Button>

            <Button
              fullWidth
              loading={saving}
              onClick={handleSave}
            >
              <Check size={16} /> Salvar
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setEditing(true)}
          >
            <Pencil size={16} /> Editar perfil
          </Button>
        )}
      </div>
    </motion.div>
  );
};