import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ---------------- TYPES ---------------- */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

/* ---------------- CONTEXT ---------------- */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ---------------- CONFIG ---------------- */

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon_color: 'text-green-400',
    text_color: 'text-green-100',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon_color: 'text-red-400',
    text_color: 'text-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon_color: 'text-yellow-400',
    text_color: 'text-yellow-100',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon_color: 'text-blue-400',
    text_color: 'text-blue-100',
  },
} as const;

/* ---------------- TOAST ITEM ---------------- */

const ToastItem = memo(({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border} shadow-lg backdrop-blur-sm min-w-[280px] max-w-[360px]`}
    >
      <Icon size={18} className={`shrink-0 ${config.icon_color}`} />
      <p className={`text-sm font-medium flex-1 ${config.text_color}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/20 hover:text-white/60 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
});
ToastItem.displayName = 'ToastItem';

/* ---------------- PROVIDER ---------------- */

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value: ToastContextValue = {
    success: useCallback((msg) => add(msg, 'success'), [add]),
    error:   useCallback((msg) => add(msg, 'error'),   [add]),
    warning: useCallback((msg) => add(msg, 'warning'), [add]),
    info:    useCallback((msg) => add(msg, 'info'),    [add]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
};