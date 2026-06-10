import { useState, useEffect, useRef } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserWorkouts } from '../../services/workoutService';
import { getUserCheckins } from '../../services/checkinService';
import { generateNotifications, AppNotification } from '../../services/notificationService';

const typeStyles = {
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
};

const typeDot = {
  warning: 'bg-yellow-400',
  info: 'bg-blue-400',
  success: 'bg-green-400',
};

export const NotificationBell = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    const [workouts, checkins] = await Promise.all([
      getUserWorkouts(user!.uid),
      getUserCheckins(user!.uid),
    ]);
    const generated = generateNotifications(workouts, checkins);
    setNotifications(generated);
  };

  const dismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visible = notifications.filter((n) => !dismissed.includes(n.id));
  const count = visible.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-white/40 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-sm font-black text-white">Notificacoes</p>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="p-6 text-center text-white/30 text-sm">
                  Nenhuma notificacao
                </div>
              ) : (
                visible.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-white/5 last:border-0 ${typeStyles[n.type]} border-l-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeDot[n.type]}`} />
                        <div>
                          <p className="text-white text-xs font-bold">{n.title}</p>
                          <p className="text-white/50 text-xs mt-0.5">{n.message}</p>
                          {n.action && (
                            <button
                              onClick={() => {
                                navigate(n.action!.path);
                                setOpen(false);
                              }}
                              className="flex items-center gap-1 text-xs font-semibold mt-2 hover:opacity-80 transition-opacity"
                            >
                              {n.action.label}
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="text-white/20 hover:text-white/60 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};