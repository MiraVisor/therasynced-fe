'use client';

import { useEffect, useState } from 'react';

import { SidebarSkeleton } from '@/components/common/sidebar/SidebarSkeleton';
import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show sidebar skeleton until mounted and role is available
  // Middleware handles auth redirect, so no need for client-side redirect here
  const showSidebarSkeleton = !isMounted || !userRole;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {showSidebarSkeleton ? <SidebarSkeleton /> : <AppSidebar userRole={userRole} />}
        <main
          className={`flex-1 overflow-y-auto p-8 w-full bg-dashboard ${showSidebarSkeleton ? 'ml-[16rem]' : ''}`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
