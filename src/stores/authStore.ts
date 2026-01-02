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
      onRehydrateStorage: () => {
        return (state) => {
          // Re-initialize from cookies when rehydrating to ensure consistency
          if (state && typeof window !== 'undefined') {
            const initialState = getInitialState();
            // If cookies have a different token than what's in state, update state
            if (
              initialState.token !== state.token ||
              initialState.isAuthenticated !== state.isAuthenticated
            ) {
              state.initialize();
            }
          }
        };
      },
    },
  ),
);

// Add cross-tab synchronization
if (typeof window !== 'undefined') {
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    // Listen for changes to auth-storage
    if (e.key === 'auth-storage' && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        const currentState = useAuthStore.getState();

        // If auth state changed in another tab, re-initialize
        if (
          newState.state?.isAuthenticated !== currentState.isAuthenticated ||
          newState.state?.role !== currentState.role
        ) {
          // Re-initialize from cookies to get the latest token
          useAuthStore.getState().initialize();

          // Check if token is still valid
          const decodedToken = getDecodedToken();
          const token = getCookie('token');
          const isTokenValid =
            decodedToken?.exp !== undefined && decodedToken.exp > Math.floor(Date.now() / 1000);

          if (!token || !isTokenValid) {
            // Token is invalid or missing, force logout
            useAuthStore.getState().logout();
            // Reload to clear any cached data if on dashboard
            if (window.location.pathname.startsWith('/dashboard')) {
              window.location.href = '/authentication/sign-in';
            }
          }
        }
      } catch (error) {
        console.error('Error syncing auth state across tabs:', error);
      }
    }
  });

  // Also check on window focus to catch any changes
  window.addEventListener('focus', () => {
    const currentState = useAuthStore.getState();
    const initialState = getInitialState();

    // If token state doesn't match, re-initialize
    if (currentState.isAuthenticated !== initialState.isAuthenticated) {
      useAuthStore.getState().initialize();

      // If token is now invalid, logout
      const decodedToken = getDecodedToken();
      const token = getCookie('token');
      const isTokenValid =
        decodedToken?.exp !== undefined && decodedToken.exp > Math.floor(Date.now() / 1000);

      if (!token || !isTokenValid) {
        useAuthStore.getState().logout();
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/authentication/sign-in';
        }
      }
    }
  });
}
