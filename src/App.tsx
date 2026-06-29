import { useEffect } from 'react';
import { onAuthChange } from './services/authService';
import { useAuthStore } from './store/useAuthStore';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const { setUser, isLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return unsubscribe;
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;