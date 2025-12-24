'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { AdminPageSkeleton } from '@/components/common/PageSkeleton';
import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarSkeleton } from '@/components/common/sidebar/SidebarSkeleton';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuthZustand';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show login success toast after navigation
  useEffect(() => {
    const loginSuccess = searchParams.get('login');
    const message = searchParams.get('message');

    if (loginSuccess && !toastShownRef.current) {
      toastShownRef.current = true;

      // Remove query parameter from URL immediately
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      url.searchParams.delete('message');
      router.replace(url.pathname + url.search, { scroll: false });

      // Show toast after a brief delay to ensure page is loaded
      setTimeout(() => {
        const toastMessage = message
          ? decodeURIComponent(message)
          : loginSuccess === 'google'
            ? 'Successfully signed in with Google!'
            : loginSuccess === 'email'
              ? 'Email verified successfully!'
              : 'Login successful!';
        toast.success(toastMessage);
      }, 100);
    }

    // Reset ref when login param is not present (user navigates away and back)
    if (!loginSuccess) {
      toastShownRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Show sidebar skeleton only on initial mount before role is available
  const showSkeleton = !isMounted || !userRole;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {showSkeleton ? <SidebarSkeleton /> : <AppSidebar userRole={userRole} />}
        <main
          className={`flex-1 overflow-y-auto p-8 w-full bg-dashboard ${showSkeleton ? 'ml-[16rem]' : ''}`}
        >
          {showSkeleton ? <AdminPageSkeleton /> : children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <SidebarSkeleton />
            <main className="flex-1 overflow-y-auto p-8 w-full bg-dashboard ml-[16rem]">
              <AdminPageSkeleton />
            </main>
          </div>
        </SidebarProvider>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
