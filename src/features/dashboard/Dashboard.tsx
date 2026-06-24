import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, CalendarCheck, TrendingUp, Clock, Dumbbell, Flame, ChevronRight } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import { Card, Button } from '../../components/ui';

/* ---------------- HELPERS ---------------- */

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const formatDate = () => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${seconds}s`;
};

/* ---------------- COMPONENT ---------------- */

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    progression,
    personalRecord,
    totalTrainingTime,
    loading,
    checkinLoading,
    checkinMsg,
    checkedToday,
    firstName,
    checkin,
  } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-5"
    >
      {/* SAUDAÇÃO */}
      <div className="mb-2">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1 capitalize">
          {formatDate()}
        </p>
        <h1 className="text-4xl font-black text-white leading-none">
          {getGreeting()}, {firstName}
        </h1>
      </div>

      {/* INICIAR TREINO — destaque principal */}
      <Button
        fullWidth
        onClick={() => navigate('/workouts')}
        className="py-5 text-base"
      >
        <Play size={20} />
        Iniciar Treino
      </Button>

      {/* CHECK-IN */}
      <Button
        fullWidth
        variant={checkedToday ? 'secondary' : 'secondary'}
        onClick={checkin}
        loading={checkinLoading}
        disabled={checkedToday}
      >
        <CalendarCheck size={18} />
        {checkedToday ? '✓ Check-in feito hoje' : 'Fazer Check-in'}
      </Button>

      {checkinMsg && (
        <p className="text-green-400 text-xs text-center">{checkinMsg}</p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-black text-white">{stats.workouts}</p>
          <p className="text-xs text-white/40 mt-1">Treinos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-black text-white">{stats.checkins}</p>
          <p className="text-xs text-white/40 mt-1">Check-ins</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-black text-white">{stats.streak}</p>
          <p className="text-xs text-white/40 mt-1">Sequência</p>
        </Card>
      </div>

      {/* TEMPO TOTAL */}
      {totalTrainingTime > 0 && (
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-white/40 text-xs">Tempo total de treino</p>
            <p className="text-white font-black text-lg">{formatDuration(totalTrainingTime)}</p>
          </div>
        </Card>
      )}

      {/* EVOLUÇÃO RECENTE */}
      {progression && (
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs">Evolução recente</p>
            <p className="text-white font-bold text-sm truncate">{progression.exerciseName}</p>
            <p className="text-green-400 text-xs font-semibold mt-0.5">
              {progression.previous} kg → {progression.current} kg
              <span className="text-white/30 ml-1">(+{progression.difference} kg)</span>
            </p>
          </div>
        </Card>
      )}

      {/* RECORDE PESSOAL */}
      {personalRecord && (
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs">Recorde pessoal</p>
            <p className="text-white font-bold text-sm truncate">{personalRecord.exerciseName}</p>
            <p className="text-yellow-400 text-xs font-semibold mt-0.5">{personalRecord.weight} kg</p>
          </div>
        </Card>
      )}

      {/* STATUS DA SEQUÊNCIA */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {stats.streak >= 7 ? '🔥' : stats.streak >= 3 ? '⚡' : stats.streak >= 1 ? '💪' : '📉'}
          </span>
          <div>
            <p className="text-white font-bold text-sm">
              {stats.streak >= 7
                ? 'Sequência incrível!'
                : stats.streak >= 3
                ? 'Boa consistência'
                : stats.streak >= 1
                ? 'Começando bem'
                : 'Hora de voltar'}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {stats.streak > 0
                ? `${stats.streak} dia${stats.streak > 1 ? 's' : ''} consecutivo${stats.streak > 1 ? 's' : ''}`
                : 'Faça check-in hoje para começar sua sequência'}
            </p>
          </div>
        </div>
      </Card>

      {/* ATALHOS */}
      <div className="space-y-2">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-1">Atalhos</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Histórico', icon: <Clock size={16} />, path: '/history' },
            { label: 'Evolução', icon: <TrendingUp size={16} />, path: '/evolution' },
            { label: 'Exercícios', icon: <Dumbbell size={16} />, path: '/exercises' },
            { label: 'Check-in', icon: <CalendarCheck size={16} />, path: '/checkin' },
          ].map((item) => (
            <Card
              key={item.path}
              hover
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-green-400">{item.icon}</span>
                <span className="text-white text-sm font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={14} className="text-white/20" />
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};