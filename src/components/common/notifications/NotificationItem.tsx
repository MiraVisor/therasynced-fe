'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, CheckCircle, CreditCard, MessageCircle, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
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

export function NotificationItem({
  notification,
  onMarkAsRead,
  onNotificationClick,
  className,
}: NotificationItemProps) {
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

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors',
        !notification.isRead && 'bg-blue-50 border-l-4 border-l-blue-500',
        className,
      )}
      onClick={handleClick}
    >
      <div className={cn('flex-shrink-0 mt-1', getTypeColor(notification.type))}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'text-sm font-medium text-gray-900',
            !notification.isRead && 'font-semibold',
          )}
        >
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <span className="text-xs text-gray-500 mt-2 block">{timeAgo}</span>
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
