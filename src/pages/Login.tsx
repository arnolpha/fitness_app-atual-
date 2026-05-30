import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, RotateCcw } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch {
      setError('E-mail ou senha invalidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg('E-mail enviado! Verifique sua caixa de entrada.');
    } catch {
      setResetMsg('E-mail nao encontrado.');
    } finally {
      setResetLoading(false);
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

        {!showReset ? (
          <>
            {/* Login */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white">Bem-vindo</h2>
              <p className="text-white/40 text-sm mt-1">Entre na sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
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
                {loading ? 'Entrando...' : 'Entrar'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={() => setShowReset(true)}
                className="text-white/30 hover:text-white text-xs font-medium transition-colors"
              >
                Esqueci minha senha
              </button>
              <p className="text-white/30 text-xs">
                Nao tem conta?{' '}
                <Link to="/register" className="text-green-400 font-semibold hover:text-green-300">
                  Criar conta
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Recuperacao de senha */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white">Recuperar</h2>
              <p className="text-white/40 text-sm mt-1">Enviaremos um link para seu e-mail</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                  <Mail size={12} />
                  E-mail
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
                />
              </div>

              {resetMsg && (
                <p className={`text-xs font-semibold ${resetMsg.includes('enviado') ? 'text-green-400' : 'text-red-400'}`}>
                  {resetMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all"
              >
                {resetLoading ? 'Enviando...' : 'Enviar link'}
                {!resetLoading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => { setShowReset(false); setResetMsg(''); }}
                className="flex items-center gap-2 text-white/30 hover:text-white text-xs font-medium transition-colors"
              >
                <RotateCcw size={12} />
                Voltar para o login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};