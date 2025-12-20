'use client';

import { useEffect, useState } from 'react';

import { AdminPageSkeleton } from '@/components/common/PageSkeleton';
import { SidebarSkeleton } from '@/components/common/sidebar/SidebarSkeleton';
import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuthZustand';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
