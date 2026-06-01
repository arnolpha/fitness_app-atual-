import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }
      setUser(result.user);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail ja esta cadastrado.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none">FitnessApp</h1>
            <p className="text-xs text-white/30 mt-0.5">Pro</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white">Criar conta</h2>
          <p className="text-white/40 text-sm mt-1">Comece sua jornada fitness hoje</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
              <User size={12} />
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
              <Mail size={12} />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
              <Lock size={12} />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimo 6 caracteres"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
              <Lock size={12} />
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Repita a senha"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <p className="text-white/30 text-xs">
            Ja tem conta?{' '}
            <Link to="/login" className="text-green-400 font-semibold hover:text-green-300">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};