/**
 * Store de autenticação (Zustand).
 *
 * Persiste user + flag de autenticação no localStorage (chave `cg.auth`)
 * para sobreviver a F5. Os tokens em si (access + refresh) ficam em
 * outro storage (`cg.accessToken`/`cg.refreshToken`) gerenciado pelo
 * `tokenStorage` em lib/axios.ts.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/types/api';
import { tokenStorage } from '@/lib/axios';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  setSession: (user: UserResponse, accessToken: string, refreshToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (user, accessToken, refreshToken) => {
        tokenStorage.set(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },
      clear: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'cg.auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
