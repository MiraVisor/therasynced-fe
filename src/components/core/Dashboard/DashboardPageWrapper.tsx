'use client';

import { useTheme } from 'next-themes';

import { NotificationPopover } from '@/components/common/notifications';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { RoleType } from '@/types/types';
import { ModeToggle } from '@/components/mode-toggler';

export function DashboardPageWrapper({
  header,
  children,
  showNotifications = true,
  userRole,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  showNotifications?: boolean;
  userRole?: RoleType | null;
}) {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const notifications = useNotifications();

  // Removed notification click navigation for now - keeping it simple

  return (
    <>
      <div className="flex flex-col gap-6 mb-1 w-full">
        <div
          className={`flex items-center ${
            !isMobile ? 'justify-between' : 'justify-between'
          } mb-8 w-full `}
        >
          <div className="hidden md:flex items-center gap-2 flex-grow">{header}</div>

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
            {/* <ModeToggle /> */}
            {showNotifications && userRole && (
              <NotificationPopover
                notifications={notifications.notifications}
                unreadCount={notifications.unreadCount}
                onMarkAsRead={notifications.markAsRead}
                onMarkAllAsRead={notifications.markAllAsRead}
                userRole={userRole}
              />
            )}
          </div>
        </div>
      </div>
      {isMobile && <div className="flex items-center gap-2 mb-4">{header}</div>}
      {children}
    </>
  );
}
