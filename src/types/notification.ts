/**
 * Notification-related types
 */
import type { NotificationPriority, NotificationType } from './enums';

export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    appointmentId?: string;
    bookingId?: string;
    freelancerId?: string;
    clientId?: string;
    slotId?: string;
    startTime?: string;
    amount?: number;
    [key: string]: unknown;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}
