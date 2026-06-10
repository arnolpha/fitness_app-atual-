import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  CalendarCheck,
  User,
  HelpCircle,
  Info,
  LogOut,
  Menu,
  History,
} from 'lucide-react';
import { NotificationBell } from './ui/NotificationBell';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/exercises', label: 'Exercicios', icon: Dumbbell },
  { path: '/workouts', label: 'Treinos', icon: ClipboardList },
  { path: '/history', label: 'Historico', icon: History },
  { path: '/evolution', label: 'Evolucao', icon: TrendingUp },
  { path: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { path: '/profile', label: 'Perfil', icon: User },
];

const bottomNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/workouts', label: 'Treinos', icon: ClipboardList },
  { path: '/history', label: 'Historico', icon: History },
  { path: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { path: '/profile', label: 'Perfil', icon: User },
];

const bottomItems = [
  { path: '/help', label: 'Ajuda', icon: HelpCircle },
  { path: '/info', label: 'Info', icon: Info },
];

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Dumbbell size={16} className="text-black" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-none">FitnessApp</h1>
            <p className="text-xs text-white/30 mt-0.5">Pro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-500 text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-500 text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Log off
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0f0f0f] border-r border-white/5 shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-60 bg-[#0f0f0f] border-r border-white/5 z-30"
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f0f0f]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <Dumbbell size={12} className="text-black" />
            </div>
            <span className="text-sm font-semibold">FitnessApp</span>
          </div>
          <NotificationBell />
        </header>

        {/* Header desktop */}
        <header className="hidden lg:flex items-center justify-end px-8 py-4 border-b border-white/5">
          <NotificationBell />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Bottom Nav Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/5 z-10">
          <div className="flex items-center justify-around px-2 py-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                      isActive ? 'text-green-500' : 'text-white/30 hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};