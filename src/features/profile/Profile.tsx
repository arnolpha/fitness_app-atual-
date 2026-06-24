import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { saveProfile, getProfile, UserProfile } from '../../services/profileService';
import {
  User, Mail, Pencil, Check, X, MapPin, Scale, Ruler, Calendar
} from 'lucide-react';
import { Card, SectionHeader, Button } from '../../components/ui';

/* ---------------- FIELD COMPONENTS ---------------- */

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-xs text-white/40 font-medium uppercase tracking-wide">
      {icon} {label}
    </label>
    <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white">
      {children}
    </div>
  </div>
);

const FieldInput = ({ value, onChange, type = 'text' }: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
  />
);

const SelectInput = ({ value, onChange, options }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-transparent text-sm text-white outline-none"
  >
    <option value="" disabled className="bg-[#111]">Selecionar</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} className="bg-[#111]">
        {opt.label}
      </option>
    ))}
  </select>
);

/* ---------------- MAIN ---------------- */

export const Profile = () => {
  const { user } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const [original, setOriginal] = useState<UserProfile>(form);

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const profile = await getProfile(user!.uid);
    if (profile) {
      setForm(profile);
      setOriginal(profile);
    }
  };

  /* ---------------- SAVE / CANCEL ---------------- */

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      setSaving(true);
      await updateProfile(auth.currentUser, { displayName: form.displayName });
      await saveProfile({ ...form, userId: user!.uid });
      setOriginal(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(original);
    setEditing(false);
  };

  /* ---------------- HELPERS ---------------- */

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Atleta';

  const getAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = getAge(form.birthDate);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <SectionHeader title="Perfil" subtitle="Minha conta" />

      {/* IDENTITY */}
      <Card className="space-y-1">
        <p className="text-white font-bold text-lg">{firstName}</p>
        <p className="text-white/40 text-sm">{user?.email}</p>
        {saved && (
          <p className="text-green-400 text-xs pt-1">✓ Perfil atualizado</p>
        )}
      </Card>

      {/* INFO FIELDS */}
      <Card className="space-y-4">

        {/* Nome */}
        <Field label="Nome" icon={<User size={12} />}>
          {editing ? (
            <FieldInput
              value={form.displayName || ''}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          ) : (
            form.displayName || '—'
          )}
        </Field>

        {/* Email — sempre readonly */}
        <Field label="Email" icon={<Mail size={12} />}>
          {user?.email}
        </Field>

        {/* Sexo */}
        <Field label="Sexo" icon={<User size={12} />}>
          {editing ? (
            <SelectInput
              value={form.sex || ''}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
                { value: 'Outro', label: 'Outro' },
              ]}
            />
          ) : (
            form.sex === 'M' ? 'Masculino' : form.sex === 'F' ? 'Feminino' : form.sex || '—'
          )}
        </Field>

        {/* Nascimento */}
        <Field label="Nascimento" icon={<Calendar size={12} />}>
          {editing ? (
            <FieldInput
              type="date"
              value={form.birthDate || ''}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          ) : (
            <span>
              {formatDate(form.birthDate)}
              {age !== null && (
                <span className="text-white/40 ml-2">({age} anos)</span>
              )}
            </span>
          )}
        </Field>

        {/* Altura + Peso */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Altura" icon={<Ruler size={12} />}>
            {editing ? (
              <FieldInput
                type="number"
                value={form.height || ''}
                onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
              />
            ) : (
              form.height ? `${form.height} cm` : '—'
            )}
          </Field>

          <Field label="Peso" icon={<Scale size={12} />}>
            {editing ? (
              <FieldInput
                type="number"
                value={form.weight || ''}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              />
            ) : (
              form.weight ? `${form.weight} kg` : '—'
            )}
          </Field>
        </div>

        {/* Cidade + Estado */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade" icon={<MapPin size={12} />}>
            {editing ? (
              <FieldInput
                value={form.city || ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            ) : (
              form.city || '—'
            )}
          </Field>

          <Field label="Estado" icon={<MapPin size={12} />}>
            {editing ? (
              <FieldInput
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
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
            <Button variant="secondary" fullWidth onClick={handleCancel}>
              <X size={16} /> Cancelar
            </Button>
            <Button fullWidth loading={saving} onClick={handleSave}>
              <Check size={16} /> Salvar
            </Button>
          </>
        ) : (
          <Button variant="secondary" fullWidth onClick={() => setEditing(true)}>
            <Pencil size={16} /> Editar perfil
          </Button>
        )}
      </div>
    </motion.div>
  );
};