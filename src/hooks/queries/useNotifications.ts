import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { NotificationFilters, notificationService } from '@/services/notificationService';

/**
 * Hook to fetch notifications
 */
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.fetchNotifications(filters),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch unread notification count
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.fetchUnreadCount(),
    select: (data) => data.count || 0,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });
};

/**
 * Combined hook for notifications with unread count (for backward compatibility)
 */
export const useNotificationsWithCount = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, error, refetch } = useNotifications(filters);
  const { data: unreadCount } = useUnreadNotificationCount();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    loadNotifications: refetch,
    markAsRead,
    markAllAsRead,
    refreshNotifications: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
  };
};
