'use client';

import { Bell, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationPriority, NotificationType, RoleType } from '@/types/types';

import { NotificationPopover } from './NotificationPopover';

interface NotificationDemoProps {
  userRole: RoleType;
  className?: string;
}

export function NotificationDemo({ userRole, className }: NotificationDemoProps) {
  const notifications = useNotifications();
  const [isAddingNotification, setIsAddingNotification] = useState(false);
  const [demoNotifications, setDemoNotifications] = useState<Notification[]>([]);

  const addSampleNotification = async () => {
    if (isAddingNotification) return;

    setIsAddingNotification(true);

    // Add a sample notification based on user role
    const sampleNotifications = {
      PATIENT: [
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'Booking Confirmed! 🎉',
          message:
            'Your physiotherapy session with Dr. Sarah Johnson has been confirmed for tomorrow at 2 PM',
          isRead: false,
          actionUrl: '/dashboard/my-bookings',
          actionText: 'View Booking',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'LOYALTY_POINTS_AWARDED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'Loyalty Points Earned! ⭐',
          message: 'You earned 50 points for completing your session. Total: 250 points',
          isRead: false,
          actionUrl: '/dashboard/account',
          actionText: 'View Points',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'BOOKING_CANCELLED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'Booking Cancelled',
          message: 'Your appointment for Friday has been cancelled. Please reschedule.',
          isRead: false,
          actionUrl: '/dashboard/my-bookings',
          actionText: 'Reschedule',
          createdAt: new Date().toISOString(),
        },
      ],
      FREELANCER: [
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'HIGH' as NotificationPriority,
          title: 'New Booking Request',
          message: 'John Smith wants to book a session for tomorrow at 2 PM',
          isRead: false,
          actionUrl: '/dashboard/appointments',
          actionText: 'Review Request',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'BOOKING_RESCHEDULED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'Booking Rescheduled',
          message: 'Sarah Wilson has rescheduled her appointment to next Tuesday',
          isRead: false,
          actionUrl: '/dashboard/appointments',
          actionText: 'View Details',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'MESSAGE' as NotificationType,
          priority: 'LOW' as NotificationPriority,
          title: 'New Message',
          message: 'You have received a new message from a patient',
          isRead: false,
          actionUrl: '/dashboard/messages',
          actionText: 'Reply',
          createdAt: new Date().toISOString(),
        },
      ],
      ADMIN: [
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'SYSTEM' as NotificationType,
          priority: 'URGENT' as NotificationPriority,
          title: 'System Alert 🚨',
          message: 'High server load detected. Immediate attention required.',
          isRead: false,
          actionUrl: '/dashboard/analytics',
          actionText: 'View Details',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'BOOKING_CREATED' as NotificationType,
          priority: 'MEDIUM' as NotificationPriority,
          title: 'New User Registration',
          message: '5 new users have registered in the last hour',
          isRead: false,
          actionUrl: '/dashboard/users',
          actionText: 'View Users',
          createdAt: new Date().toISOString(),
        },
        {
          id: `demo-${Date.now()}-${Math.random()}`,
          type: 'LOYALTY_REWARD_REDEEMED' as NotificationType,
          priority: 'LOW' as NotificationPriority,
          title: 'Reward Redeemed',
          message: 'A user has redeemed a loyalty reward',
          isRead: false,
          actionUrl: '/dashboard/analytics',
          actionText: 'View Analytics',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const roleNotifications = sampleNotifications[userRole] || sampleNotifications.PATIENT;
    const randomNotification =
      roleNotifications[Math.floor(Math.random() * roleNotifications.length)];

    // Add to demo notifications
    setDemoNotifications((prev) => [randomNotification, ...prev]);

    // Simulate API delay
    setTimeout(() => {
      setIsAddingNotification(false);
    }, 1000);
  };

  const clearAllDemoNotifications = () => {
    setDemoNotifications([]);
  };

  // Combine real notifications with demo notifications
  const allNotifications = [...demoNotifications, ...notifications.notifications];
  const totalUnreadCount =
    demoNotifications.filter((n) => !n.isRead).length + notifications.unreadCount;

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
              Unread: <span className="font-medium text-red-600">{totalUnreadCount}</span>
            </p>
          </div>
          <NotificationPopover
            notifications={allNotifications}
            unreadCount={totalUnreadCount}
            isLoading={notifications.isLoading}
            onLoadNotifications={notifications.loadNotifications}
            onMarkAsRead={notifications.markAsRead}
            onMarkAllAsRead={notifications.markAllAsRead}
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
            onClick={clearAllDemoNotifications}
            variant="outline"
            size="sm"
            disabled={demoNotifications.length === 0}
          >
            Clear Demo
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
