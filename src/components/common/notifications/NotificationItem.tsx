'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, CheckCircle, CreditCard, MessageCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/types';

interface NotificationItemProps {
  notification: Notification;
  className?: string;
  onMarkAsRead?: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'APPOINTMENT':
      return Calendar;
    case 'BOOKING':
    case 'BOOKING_CREATED':
      return CheckCircle;
    case 'BOOKING_CANCELLED':
      return CheckCircle;
    case 'BOOKING_RESCHEDULED':
      return CheckCircle;
    case 'PAYMENT':
      return CreditCard;
    case 'LOYALTY_POINTS_AWARDED':
    case 'LOYALTY_REWARD_REDEEMED':
      return Star;
    case 'MESSAGE':
      return MessageCircle;
    case 'REVIEW':
      return Star;
    case 'SYSTEM':
    default:
      return Bell;
  }
};

// Removed priority color function - keeping it simple

const getTypeColor = (type: NotificationType) => {
  switch (type) {
    case 'APPOINTMENT':
      return 'text-blue-600';
    case 'BOOKING':
    case 'BOOKING_CREATED':
      return 'text-green-600';
    case 'BOOKING_CANCELLED':
      return 'text-red-600';
    case 'BOOKING_RESCHEDULED':
      return 'text-orange-600';
    case 'PAYMENT':
      return 'text-purple-600';
    case 'LOYALTY_POINTS_AWARDED':
    case 'LOYALTY_REWARD_REDEEMED':
      return 'text-yellow-600';
    case 'MESSAGE':
      return 'text-indigo-600';
    case 'REVIEW':
      return 'text-yellow-600';
    case 'SYSTEM':
    default:
      return 'text-gray-600';
  }
};

export function NotificationItem({ notification, className, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter();
  const Icon = getNotificationIcon(notification.type);

  // Safely format the date, handling invalid dates
  const getTimeAgo = () => {
    if (!notification.createdAt) {
      return 'Recently';
    }
    try {
      const date = new Date(notification.createdAt);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const timeAgo = getTimeAgo();

  const handleActionClick = () => {
    if (notification.actionUrl) {
      // Mark as read if not already read
      if (!notification.isRead && onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      router.push(notification.actionUrl);
    }
  };

  const hasAction = !!notification.actionText && !!notification.actionUrl;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 transition-colors border-b border-gray-100 last:border-b-0',
        !notification.isRead && 'bg-blue-50/50 border-l-4 border-l-blue-500',
        notification.isRead && 'bg-white hover:bg-gray-50/50',
        className,
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 mt-0.5 p-2 rounded-lg',
          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100',
          getTypeColor(notification.type),
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-poppins leading-snug',
              !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
            )}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm font-inter text-gray-600 mt-1.5 leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2.5">
          <span className="text-xs font-inter text-gray-500">{timeAgo}</span>
          {hasAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActionClick}
              className="text-xs h-7 px-3"
            >
              {notification.actionText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
