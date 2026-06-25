import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard, Dumbbell, ClipboardList, TrendingUp,
  CalendarCheck, User, HelpCircle, Info, LogOut, Menu, History,
} from 'lucide-react';
import { NotificationBell } from './ui/NotificationBell';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/exercises', label: 'Exercícios', icon: Dumbbell },
  { path: '/workouts', label: 'Treinos', icon: ClipboardList },
  { path: '/history', label: 'Histórico', icon: History },
  { path: '/evolution', label: 'Evolução', icon: TrendingUp },
  { path: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { path: '/profile', label: 'Perfil', icon: User },
];

const bottomNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/workouts', label: 'Treinos', icon: ClipboardList },
  { path: '/history', label: 'Histórico', icon: History },
  { path: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { path: '/profile', label: 'Perfil', icon: User },
];

const bottomItems = [
  { path: '/help', label: 'Ajuda', icon: HelpCircle },
  { path: '/info', label: 'Info', icon: Info },
];

// ✅ Fora do Layout — evita recriação a cada render
interface SidebarContentProps {
  onClose: () => void;
  onLogout: () => void;
}

const SidebarContent = ({ onClose, onLogout }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    <div className="p-6 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
          <Dumbbell size={18} className="text-black" />
        </div>
        <div>
          <h1 className="text-base font-black text-white leading-none">Apex Fitness</h1>
          <p className="text-xs text-white/30 mt-0.5">Pro</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-500 text-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="p-3 border-t border-white/5 space-y-1">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-500 text-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            {item.label}
          </NavLink>
        );
      })}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
      >
        <LogOut size={20} />
        Log off
      </button>
    </div>
  </div>
);

// ✅ Hook robusto para detectar desktop — evita leitura prematura do window
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    setIsDesktop(mq.matches); // sincroniza na montagem
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
};

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate('/login');
  };

  const handleClose = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a', color: 'white', overflow: 'hidden' }}>

      {/* Sidebar Desktop */}
      {isDesktop && (
        <aside style={{ width: '256px', backgroundColor: '#0f0f0f', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <SidebarContent onClose={handleClose} onLogout={handleLogout} />
        </aside>
      )}

      {/* Sidebar Mobile overlay */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
          >
            <div
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)' }}
              onClick={handleClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '256px', backgroundColor: '#0f0f0f', borderRight: '1px solid rgba(255,255,255,0.05)', zIndex: 30, display: 'flex', flexDirection: 'column' }}
            >
              <SidebarContent onClose={handleClose} onLogout={handleLogout} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header mobile */}
        {!isDesktop && (
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0f0f0f' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ color: 'rgba(255,255,255,0.6)' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={14} color="black" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: 900 }}>Apex Fitness</span>
            </div>
            <NotificationBell />
          </header>
        )}

        {/* Header desktop */}
        {isDesktop && (
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <NotificationBell />
          </header>
        )}

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '32px' : '16px', paddingBottom: isDesktop ? '32px' : '96px' }}>
          <Outlet />
        </main>

        {/* Bottom Nav Mobile */}
        {!isDesktop && (
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 8px 12px' }}>
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                        isActive ? 'text-green-500' : 'text-white/30'
                      }`
                    }
                  >
                    <Icon size={22} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};