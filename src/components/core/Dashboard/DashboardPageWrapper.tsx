'use client';

import { Bell } from 'lucide-react';
import { useTheme } from 'next-themes';

import { ModeToggle } from '@/components/mode-toggler';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function DashboardPageWrapper({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex flex-col gap-6 mb-1 w-full ">
        <div
          className={`flex items-center ${
            !isMobile ? 'justify-between' : 'justify-between'
          } mb-8 w-full`}
        >
          <div className="hidden md:flex items-center gap-2">{header}</div>

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
      </div>
      {isMobile && <div className="flex items-center gap-2 mb-4">{header}</div>}
      {children}
    </>
  );
}
