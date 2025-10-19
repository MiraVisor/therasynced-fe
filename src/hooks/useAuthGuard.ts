import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCookie, getDecodedToken } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export const useAuthGuard = () => {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // First, check if token exists in cookie
      const tokenFromCookie = getCookie('token');

      if (!tokenFromCookie) {
        router.push('/authentication/sign-in');
        return;
      }

      // Token exists, validate it
      const decodedToken = getDecodedToken();
      if (!decodedToken) {
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        router.push('/authentication/sign-in');
        return;
      }

      // Token is valid, wait for Redux to initialize
      if (!isAuthenticated || !role) {
        // Still initializing, don't redirect
        return;
      }

      // All checks passed
      setIsValid(true);
      setIsChecking(false);
    };

    // Small delay to allow Redux initialization
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
