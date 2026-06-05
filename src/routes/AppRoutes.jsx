import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Layout } from '../components/Layout';
import { Dashboard } from '../features/dashboard/Dashboard';
import { Exercises } from '../features/exercises/Exercises';
import { Workouts } from '../features/workouts/Workouts';
import { Profile } from '../features/profile/Profile';
import { Checkin } from '../features/checkin/Checkin';
import { Evolution } from '../features/evolution/Evolution';
import { History } from '../features/workouts/History';

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-white/40 text-lg">{title} — em breve</p>
  </div>
);

export const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="evolution" element={<Evolution />} />
          <Route path="checkin" element={<Checkin />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<History />} />
          <Route path="help" element={<Placeholder title="Ajuda" />} />
          <Route path="info" element={<Placeholder title="Info" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};