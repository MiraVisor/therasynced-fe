'use client';

import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCookie, isTokenValid } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { checkAuth } from '@/redux/slices/authSlice';
import store from '@/redux/store';

import Unauthorized from '../unauthorized';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role: userRole, token } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [forceCheckDone, setForceCheckDone] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Force authentication check on mount
  useEffect(() => {
    if (hydrated && !forceCheckDone) {
      setForceCheckDone(true);

      // Check if we have a valid token but Redux state isn't updated
      const hasValidToken = isTokenValid();
      const cookieToken = getCookie('token');

      // If we have a valid token but Redux state is empty, force update
      if (hasValidToken && cookieToken && (!isAuthenticated || !userRole || !token)) {
        store.dispatch(checkAuth());

        // Check again after a short delay
        setTimeout(() => {
          store.dispatch(checkAuth());
        }, 200);
      }
    }
  }, [hydrated, isAuthenticated, userRole, token, forceCheckDone]);

  // Show loading while hydrating
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check for valid token directly
  const hasValidToken = isTokenValid();
  const cookieToken = getCookie('token');

  // Show unauthorized if no valid token
  if (!hasValidToken || !cookieToken) {
    return (
      <>
        <Unauthorized />
      </>
    );
  }

  // Show loading while role is being determined
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
