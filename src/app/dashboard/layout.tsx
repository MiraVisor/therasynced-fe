'use client';

import { Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/common/sidebar/app-sidebar';
import { ModeToggle } from '@/components/mode-toggler';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn, useIsMobile } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role: userRole } = useAuth();
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, [userRole]);

  if (!hydrated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-8 w-full bg-dashboard">
          <div
            className={`flex items-center ${
              isMobile ? 'justify-between' : 'justify-end'
            } mb-8 w-full`}
          >
            {isMobile && (
              <SidebarTrigger
                className={cn(
                  'h-10 w-10 border bg-background shadow-sm',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  resolvedTheme === 'dark'
                    ? 'border-border/40 hover:border-border/60'
                    : 'border-border/20 hover:border-border/40',
                )}
              />
            )}

            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant={'outline'} className="h-10 w-10 p-0">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
