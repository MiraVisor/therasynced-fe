import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCookie, getDecodedToken, removeCookie, setCookie } from '@/lib/utils';
import { RoleType } from '@/types/types';
import { clearLocalStorageDrafts } from '@/utils/clearLocalStorageDrafts';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: RoleType | null;

  // Actions
  login: (token: string, role: RoleType) => void;
  logout: () => void;
  setRole: (role: RoleType) => void;
  initialize: () => void;
}

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      token: null,
      role: null,
    };
  }

  const decodedToken = getDecodedToken();
  const token = getCookie('token');

  // Check if token is valid and not expired
  const isTokenValid =
    decodedToken?.exp !== undefined && decodedToken.exp > Math.floor(Date.now() / 1000);

  return {
    isAuthenticated: !!token && !!isTokenValid,
    token: isTokenValid ? token : null,
    role: isTokenValid ? (decodedToken?.role as RoleType) : null,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...getInitialState(),

      login: (token: string, role: RoleType) => {
        if (typeof window !== 'undefined') {
          setCookie('token', token);
        }
        set({
          isAuthenticated: true,
          token,
          role,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          removeCookie('token');
          clearLocalStorageDrafts();
        }
        set({
          isAuthenticated: false,
          token: null,
          role: null,
        });
      },

      setRole: (role: RoleType) => {
        set({ role });
      },

      initialize: () => {
        const initialState = getInitialState();
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        // Don't persist token - it's in cookies
      }),
    },
  ),
);
