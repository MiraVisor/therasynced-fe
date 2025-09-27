'use client';

import { Bell, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPriority, NotificationType, RoleType } from '@/types/types';

import { NotificationPopover } from './NotificationPopover';

interface NotificationDemoProps {
  userRole: RoleType;
  className?: string;
}

export function NotificationDemo({ userRole, className }: NotificationDemoProps) {
  const notifications = useNotifications();
  const [isAddingNotification, setIsAddingNotification] = useState(false);

  const addSampleNotification = async () => {
    if (isAddingNotification) return;

    setIsAddingNotification(true);

    // Add a sample notification based on user role
    const sampleNotifications = {
      PATIENT: [
        {
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'Booking Confirmed! 🎉',
          message:
            'Your physiotherapy session with Dr. Sarah Johnson has been confirmed for tomorrow at 2 PM',
          isRead: false,
          actionUrl: '/dashboard/my-bookings',
          actionText: 'View Booking',
        },
        {
          type: 'LOYALTY_POINTS_AWARDED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'Loyalty Points Earned! ⭐',
          message: 'You earned 50 points for completing your session. Total: 250 points',
          isRead: false,
          actionUrl: '/dashboard/account',
          actionText: 'View Points',
        },
        {
          type: 'BOOKING_CANCELLED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'Booking Cancelled',
          message: 'Your appointment for Friday has been cancelled. Please reschedule.',
          isRead: false,
          actionUrl: '/dashboard/my-bookings',
          actionText: 'Reschedule',
        },
      ],
      FREELANCER: [
        {
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'New Booking Request',
          message: 'John Smith wants to book a session for tomorrow at 2 PM',
          isRead: false,
          actionUrl: '/dashboard/appointments',
          actionText: 'Review Request',
        },
        {
          type: 'BOOKING_RESCHEDULED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'Booking Rescheduled',
          message: 'Sarah Wilson has rescheduled her appointment to next Tuesday',
          isRead: false,
          actionUrl: '/dashboard/appointments',
          actionText: 'View Details',
        },
        {
          type: 'MESSAGE' as NotificationType,
          priority: 'LOW' as NotificationPriority,
          title: 'New Message',
          message: 'You have received a new message from a patient',
          isRead: false,
          actionUrl: '/dashboard/messages',
          actionText: 'Reply',
        },
      ],
      ADMIN: [
        {
          type: 'SYSTEM' as NotificationType,
          priority: 'URGENT' as NotificationPriority,
          title: 'System Alert 🚨',
          message: 'High server load detected. Immediate attention required.',
          isRead: false,
          actionUrl: '/dashboard/analytics',
          actionText: 'View Details',
        },
        {
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'New User Registration',
          message: '5 new users have registered in the last hour',
          isRead: false,
          actionUrl: '/dashboard/users',
          actionText: 'View Users',
        },
        {
          type: 'LOYALTY_REWARD_REDEEMED' as NotificationType,
          priority: 'LOW' as NotificationPriority,
          title: 'Reward Redeemed',
          message: 'A user has redeemed a loyalty reward',
          isRead: false,
          actionUrl: '/dashboard/analytics',
          actionText: 'View Analytics',
        },
      ],
    };

    const roleNotifications = sampleNotifications[userRole] || sampleNotifications.PATIENT;
    const randomNotification =
      roleNotifications[Math.floor(Math.random() * roleNotifications.length)];

    notifications.addNotification(randomNotification);

    // Simulate API delay
    setTimeout(() => {
      setIsAddingNotification(false);
    }, 1000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium">{userRole}</span>
            </p>
            <p className="text-sm text-gray-600">
              Unread: <span className="font-medium text-red-600">{notifications.unreadCount}</span>
            </p>
          </div>
          <NotificationPopover
            notifications={notifications.notifications}
            unreadCount={notifications.unreadCount}
            onMarkAsRead={notifications.markAsRead}
            onMarkAllAsRead={notifications.markAllAsRead}
            userRole={userRole}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={addSampleNotification}
            disabled={isAddingNotification}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAddingNotification ? 'Adding...' : 'Add Sample Notification'}
          </Button>

          <Button
            onClick={notifications.markAllAsRead}
            variant="outline"
            size="sm"
            disabled={notifications.unreadCount === 0}
          >
            Mark All Read
          </Button>

          <Button
            onClick={notifications.clearAllNotifications}
            variant="outline"
            size="sm"
            disabled={notifications.notifications.length === 0}
          >
            Clear All
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Click the bell icon to open notifications</p>
          <p>• Notifications are filtered based on your role</p>
          <p>• Click &quot;Add Sample Notification&quot; to test the system</p>
        </div>
      </CardContent>
    </Card>
  );
}
