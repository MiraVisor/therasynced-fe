import { ApiResponse, Notification } from '@/types/types';

import api from './api';

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  // Fetch notifications with pagination and filtering
  async fetchNotifications(
    filters: NotificationFilters = {},
  ): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

    const response = await api.get(`/notifications?${params.toString()}`);

    // Transform the response to match expected format
    const apiResponse = response.data;

    // Transform snake_case to camelCase for notifications
    const transformedData = (apiResponse.data || []).map((notification: any) => ({
      id: notification.id,
      userId: notification.user_id || notification.userId,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      isRead: notification.is_read !== undefined ? notification.is_read : notification.isRead,
      createdAt: notification.created_at || notification.createdAt,
      updatedAt: notification.updated_at || notification.updatedAt,
      actionUrl: notification.action_url || notification.actionUrl,
      actionText: notification.action_text || notification.actionText,
      metadata: notification.metadata,
    }));

    return {
      success: apiResponse.success,
      message: apiResponse.message,
      data: transformedData,
      meta: apiResponse.meta || {
        timestamp: new Date().toISOString(),
        path: '/notifications',
      },
    };
  },

  // Fetch unread count
  async fetchUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/mark-read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },

  // Mark notification as unread
  async markAsUnread(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/mark-unread`);
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Create notification (for testing/admin purposes)
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Notification> {
    try {
      const response = await api.post('/notifications', notification);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create notification');
    }
  },
};
