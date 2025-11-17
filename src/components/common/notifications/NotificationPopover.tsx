'use client';

import { Bell, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/types';

import { NotificationBadge } from './NotificationBadge';
import { NotificationItem } from './NotificationItem';

interface NotificationPopoverProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onLoadNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  className?: string;
}

export function NotificationPopover({
  notifications,
  unreadCount,
  isLoading,
  onLoadNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load notifications when popover opens
  useEffect(() => {
    if (isOpen && !hasLoaded && !isLoading) {
      setHasLoaded(true);
      onLoadNotifications();
    }
  }, [isOpen, hasLoaded, isLoading, onLoadNotifications]);

  // Reset hasLoaded when popover closes
  useEffect(() => {
    if (!isOpen) {
      setHasLoaded(false);
    }
  }, [isOpen]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'relative h-10 w-10 hover:bg-gray-50',
            unreadCount > 0 && 'ring-2 ring-blue-500 ring-opacity-50',
            className,
          )}
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-80 p-0 max-w-sm"
        align="end"
        sideOffset={8}
        side="bottom"
        avoidCollisions={true}
        collisionPadding={16}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-6 px-2"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-blue-50">
                    <p className="text-xs font-medium text-blue-700">
                      {unreadNotifications.length} unread
                    </p>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                    />
                  ))}
                </div>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <div>
                  {unreadNotifications.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600">Earlier</p>
                    </div>
                  )}
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
