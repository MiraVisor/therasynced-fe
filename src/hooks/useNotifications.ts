'use client';

import { useCallback, useEffect, useState } from 'react';

import { notificationService } from '@/services/notificationService';
import { Notification, NotificationFilters, NotificationState } from '@/types/types';

// Mock data for demonstration - replace with actual API calls

export function useNotifications(filters: NotificationFilters = {}) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null,
  });

  // Load notifications
  const loadNotifications = useCallback(async (customFilters?: NotificationFilters) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const currentFilters = { ...filters, ...customFilters };
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        notificationService.fetchNotifications(currentFilters),
        notificationService.fetchUnreadCount(),
      ]);

      console.log('API Response:', notificationsResponse);
      console.log('Notifications data:', notificationsResponse.data);

      setState({
        notifications: notificationsResponse.data || [],
        unreadCount: unreadCountResponse.count || 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Show error state instead of using mock data
      setState({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      });
    }
  }, []);

  // Load notifications on mount only
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        // Optimistic update
        setState((prev) => {
          const updatedNotifications = prev.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true, updatedAt: new Date().toISOString() }
              : notification,
          );

          const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

          return {
            ...prev,
            notifications: updatedNotifications,
            unreadCount,
          };
        });

        // API call
        await notificationService.markAsRead(id);
      } catch (error) {
        // Revert optimistic update on error
        loadNotifications();
      }
    },
    [loadNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setState((prev) => {
        const updatedNotifications = prev.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          updatedAt: new Date().toISOString(),
        }));

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: 0,
        };
      });

      // API call
      await notificationService.markAllAsRead();
    } catch (error) {
      // Revert optimistic update on error
      loadNotifications();
    }
  }, [loadNotifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        notifications: [newNotification, ...prev.notifications],
        unreadCount: prev.unreadCount + (newNotification.isRead ? 0 : 1),
      }));
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.filter((n) => n.id !== id);
      const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  }, []);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
  };
}
