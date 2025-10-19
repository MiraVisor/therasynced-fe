'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCookie, getDecodedToken } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // First, check if token exists in cookie (direct check, no Redux dependency)
      const tokenFromCookie = getCookie('token');

      if (!tokenFromCookie) {
        // No token at all, redirect to login
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Token exists, now validate it
      const decodedToken = getDecodedToken();
      if (!decodedToken) {
        // Token is invalid, redirect to login
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, redirect to login
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Token is valid, wait for Redux state to initialize
      if (!isAuthenticated || !userRole) {
        // Redux state not initialized yet, wait
        return;
      }

      // All checks passed
      setHydrated(true);
    };

    checkAuth();
  }, [isAuthenticated, userRole, router]);

  // Show loading while checking authentication
  if (!hydrated && !isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show redirect message
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-8 w-full bg-dashboard">{children}</main>
      </div>
    </SidebarProvider>
  );
}
