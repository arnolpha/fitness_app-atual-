import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// ✅ Lazy loading — cada página só carrega quando o usuário navegar até ela
const Login    = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const Layout   = lazy(() => import('../components/Layout').then(m => ({ default: m.Layout })));

const Dashboard = lazy(() => import('../features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Exercises = lazy(() => import('../features/exercises/Exercises').then(m => ({ default: m.Exercises })));
const Workouts  = lazy(() => import('../features/workouts/Workouts').then(m => ({ default: m.Workouts })));
const History   = lazy(() => import('../features/workouts/History').then(m => ({ default: m.History })));
const Evolution = lazy(() => import('../features/evolution/Evolution').then(m => ({ default: m.Evolution })));
const Checkin   = lazy(() => import('../features/checkin/Checkin').then(m => ({ default: m.Checkin })));
const Profile   = lazy(() => import('../features/profile/Profile').then(m => ({ default: m.Profile })));

// ✅ Fallback elegante durante o carregamento de cada página
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      <p className="text-white/30 text-xs">Carregando...</p>
    </div>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-white/40 text-lg">{title} — em breve</p>
  </div>
);

export const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"    element={!isAuthenticated ? <Login />    : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index          element={<Dashboard />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="workouts"  element={<Workouts />} />
            <Route path="evolution" element={<Evolution />} />
            <Route path="checkin"   element={<Checkin />} />
            <Route path="profile"   element={<Profile />} />
            <Route path="history"   element={<History />} />
            <Route path="help"      element={<Placeholder title="Ajuda" />} />
            <Route path="info"      element={<Placeholder title="Info" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};