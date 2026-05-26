import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const { setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        Carregando...
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
