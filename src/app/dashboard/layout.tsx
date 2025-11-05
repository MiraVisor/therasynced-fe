'use client';

import { useEffect, useState } from 'react';

import { AdminPageSkeleton } from '@/components/common/PageSkeleton';
import {
  SidebarSkeleton,
  SidebarSkeletonMobile,
} from '@/components/common/sidebar/SidebarSkeleton';
import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Desktop Sidebar */}
        {isMounted ? (
          <>
            <SidebarSkeleton />
            <SidebarSkeletonMobile />
          </>
        ) : (
          <AppSidebar userRole={userRole} />
        )}

        <main className="flex-1 overflow-y-auto p-8 w-full bg-dashboard">
          {isMounted ? <AdminPageSkeleton /> : children}
        </main>
      </div>
    </SidebarProvider>
  );
}
