'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import LandingPage from '@/components/core/LandingPage/page';
import { getDecodedToken, isTokenValid } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Client-side authentication check
  useEffect(() => {
    if (hasMounted && !authChecked) {
      setAuthChecked(true);

      const hasValidToken = isTokenValid();

      if (hasValidToken && !isAuthenticated) {
        // Token exists but Redux state isn't updated yet
        // Wait a bit for Redux to rehydrate, then check again
        const timer = setTimeout(() => {
          if (isTokenValid() && !isAuthenticated) {
            // If still not authenticated after delay, redirect to sign-in
            router.push('/authentication/sign-in');
          }
        }, 1000);

        return () => clearTimeout(timer);
      } else if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        const decodedToken = getDecodedToken();
        if (decodedToken?.email) {
          const handleSignOut = () => {
            logout();
            router.push('/');
            toast.dismiss();
          };

          toast.success(
            <div className="flex flex-col items-start">
              <span>Welcome back! Signed in as {decodedToken.email}</span>
              <button onClick={handleSignOut} className=" text-sm text-destructive">
                Not your account? Sign out
              </button>
            </div>,
          );
        }
        router.replace('/dashboard');
      }
    }
  }, [hasMounted, isAuthenticated, router, logout, authChecked]);

  if (!hasMounted) return null;

  // Don't render landing page if user is authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <LandingPage />;
}
