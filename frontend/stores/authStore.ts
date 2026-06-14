import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Company } from '@/types';

interface AuthStore {
  user: User | null;
  company: Company | null;
  access_token: string | null;
  setAuth: (user: User, company: Company | null, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      access_token: null,

      setAuth: (user, company, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mantis_token', token);
        }
        set({ user, company, access_token: token });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mantis_token');
        }
        set({ user: null, company: null, access_token: null });
      },
    }),
    {
      name: 'mantis-auth',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        access_token: state.access_token,
      }),
    }
  )
);
