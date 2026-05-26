import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // Guardará os dados do usuário logado
  isAuthenticated: false,
  isLoading: true, // Importante para não mostrar a tela errada enquanto o Firebase carrega

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
