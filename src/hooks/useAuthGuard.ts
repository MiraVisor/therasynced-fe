import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getDecodedToken } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export const useAuthGuard = () => {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is valid
      const decodedToken = getDecodedToken();
      if (!decodedToken) {
        // Token is invalid or expired, redirect to login
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, redirect to login
        router.push('/authentication/sign-in');
        return;
      }

      // Check if role is set
      if (!role) {
        // Role not set, still checking
        return;
      }

      // All checks passed
      setIsValid(true);
      setIsChecking(false);
    };

    // Add a small delay to ensure Redux state is properly initialized
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, role, router]);

  return {
    isChecking,
    isValid,
    isAuthenticated,
    role,
  };
};
