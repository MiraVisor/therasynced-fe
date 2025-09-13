'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getDecodedToken } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is valid
      const decodedToken = getDecodedToken();
      if (!decodedToken) {
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        setIsRedirecting(true);
        router.push('/authentication/sign-in');
        return;
      }

      // Check if role is set
      if (!userRole) {
        return; // Still loading
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
