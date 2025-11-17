'use client';

import { useCallback, useEffect, useState } from 'react';

import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load unread count only
  const loadUnreadCount = useCallback(async () => {
    try {
      const unreadCountResponse = await notificationService.fetchUnreadCount();
      setUnreadCount(unreadCountResponse.count || 0);
    } catch (error) {
      setUnreadCount(0);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const notificationsResponse = await notificationService.fetchNotifications();
      setNotifications(notificationsResponse.data || []);

      // Also update unread count
      await loadUnreadCount();

      setIsLoading(false);
      setError(null);
    } catch (error) {
      setNotifications([]);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to load notifications');
    }
  }, [loadUnreadCount]);

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationService.markAsRead(id);
        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        // Refresh unread count
        await loadUnreadCount();
      } catch (error) {
        // Error handling - could add toast notification here if needed
      }
    },
    [loadUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Refresh unread count
      await loadUnreadCount();
    } catch (error) {
      // Error handling - could add toast notification here if needed
    }
  }, [loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadUnreadCount,
  };
}
