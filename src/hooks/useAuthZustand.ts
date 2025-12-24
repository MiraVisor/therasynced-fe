import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to access auth state and actions from Zustand store
 * This replaces the Redux useAuth hook
 */
export const useAuth = () => {
  const { isAuthenticated, token, role, login, logout, setRole, initialize } = useAuthStore();

  return {
    isAuthenticated,
    token,
    role,
    login,
    logout,
    setRole,
    initialize,
  };
};
