'use client';

import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, [userRole]);

  if (!hydrated) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-8 w-full bg-dashboard">{children}</main>
      </div>
    </SidebarProvider>
  );
}
