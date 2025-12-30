import { create } from 'zustand';
import { Session } from 'next-auth';

interface AuthState {
  session:  Session | null;
  isLoading: boolean;
  
  // Actions
  setSession: (session:  Session | null) => void;
  setLoading: (loading:  boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,

  setSession: (session) => set({ session, isLoading: false }),
  setLoading:  (isLoading) => set({ isLoading }),
}));