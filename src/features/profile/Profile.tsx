import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins, getStreak } from '../../services/checkinService';
import { saveProfile, getProfile, UserProfile } from '../../services/profileService';
import {
  User, Mail, ShieldCheck, Dumbbell, CalendarCheck,
  Flame, Pencil, Check, X, MapPin, Scale, Ruler, Calendar,
  Download, Trash2, Key
} from 'lucide-react';
import { Card, SectionHeader, Button, Input } from '../../components/ui';

const sexOptions = ['Masculino', 'Feminino', 'Prefiro nao informar'];

const brazilStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export const Profile = () => {
  const { user } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ workouts: 0, checkins: 0, streak: 0 });

  const [form, setForm] = useState<UserProfile>({
    userId: user?.uid || '',
    displayName: user?.displayName || '',
    sex: '',
    birthDate: '',
    height: undefined,
    weight: undefined,
    weightGoal: undefined,
    workoutsGoal: undefined,
    city: '',
    state: '',
    photoURL: '',
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

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const bmi = form.height && form.weight
    ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
    : null;

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    await updateProfile(auth.currentUser, {
      displayName: form.displayName,
      photoURL: form.photoURL || null,
    });

    await saveProfile({ ...form, userId: user!.uid });

    setSaving(false);
    setEditing(false);
  };

  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, photoURL: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const exportProfile = () => {
    window.print();
  };

  const changePassword = async () => {
    if (!auth.currentUser) return;
    const newPass = prompt('Nova senha:');
    if (newPass) await updatePassword(auth.currentUser, newPass);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    const ok = confirm('Tem certeza que deseja excluir sua conta?');
    if (ok) await deleteUser(auth.currentUser);
  };

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div className="max-w-lg mx-auto">
      <SectionHeader title="Perfil" subtitle="Minha conta" />

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-xl font-black overflow-hidden">
          {form.photoURL
            ? <img src={form.photoURL} className="w-full h-full object-cover" />
            : initials}
        </div>

        <div>
          <p className="text-white font-bold">{form.displayName}</p>
          <p className="text-white/40 text-sm">{user?.email}</p>

          <input type="file" onChange={handlePhotoUpload} className="text-xs mt-2" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>🏋️ {stats.workouts}</Card>
        <Card>📅 {stats.checkins}</Card>
        <Card>🔥 {stats.streak}d</Card>
      </div>

      {/* IMC */}
      {bmi && (
        <Card className="mb-4">
          <p className="text-white">IMC: {bmi}</p>
        </Card>
      )}

      {/* Meta */}
      <Card className="space-y-3">
        <Input
          label="Meta de peso (kg)"
          value={form.weightGoal || ''}
          onChange={(v) => setForm({ ...form, weightGoal: Number(v) })}
        />

        <Input
          label="Meta treinos/semana"
          value={form.workoutsGoal || ''}
          onChange={(v) => setForm({ ...form, workoutsGoal: Number(v) })}
        />
      </Card>

      {/* Actions */}
      <div className="grid gap-3 mt-5">
        <Button onClick={() => setEditing(!editing)}>
          <Pencil size={16} /> Editar
        </Button>

        <Button onClick={handleSave} loading={saving}>
          <Check size={16} /> Salvar
        </Button>

        <Button onClick={exportProfile} variant="secondary">
          <Download size={16} /> Exportar PDF
        </Button>

        <Button onClick={changePassword} variant="secondary">
          <Key size={16} /> Alterar senha
        </Button>

        <Button onClick={deleteAccount} variant="danger">
          <Trash2 size={16} /> Excluir conta
        </Button>
      </div>
    </motion.div>
  );
};