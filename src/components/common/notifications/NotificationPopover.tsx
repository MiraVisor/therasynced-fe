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

  const handleMarkAllAsRead = async () => {
    try {
      await onMarkAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
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
        className="w-[calc(100vw-2rem)] sm:w-96 p-0 max-w-sm shadow-lg border-gray-200"
        align="end"
        sideOffset={8}
        side="bottom"
        avoidCollisions={true}
        collisionPadding={16}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-700" />
              <h3 className="font-poppins font-semibold text-lg text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isLoading}
              className="text-xs h-7 px-2.5 hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[400px] sm:h-[500px]">
          <div className="min-h-full">
            {isLoading && notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-10 w-10 mx-auto mb-3 text-gray-400 animate-pulse" />
                <p className="text-sm font-inter text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-poppins font-medium text-gray-600 mb-1">
                  No notifications
                </p>
                <p className="text-xs font-inter text-gray-500">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div>
                {/* Unread notifications */}
                {unreadNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100/50 sticky top-0 z-10">
                      <p className="text-xs font-poppins font-semibold text-blue-700 uppercase tracking-wide">
                        {unreadNotifications.length}{' '}
                        {unreadNotifications.length === 1 ? 'Unread' : 'Unread'}
                      </p>
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                )}

                {/* Read notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    {unreadNotifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 sticky top-0 z-10">
                        <p className="text-xs font-poppins font-semibold text-gray-600 uppercase tracking-wide">
                          Earlier
                        </p>
                      </div>
                    )}
                    {readNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
