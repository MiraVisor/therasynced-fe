import { PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface OverrideAccessDto {
  action: 'GRANT' | 'REVOKE';
  reason: string;
  duration?: number; // in days
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  monthlyRevenue: number;
  planDistribution: Array<{
    planName: string;
    count: number;
  }>;
}

const adminSubscriptionService = {
  // Get all subscriptions
  getAll: async (pagination?: PaginationDto, filters?: { status?: string; planId?: string }) => {
    const response = await api.get(ENDPOINTS.admin.subscription.getAll, {
      params: { ...pagination, ...filters },
    });
    return response.data;
  },

  // Get subscription stats
  getStats: async () => {
    const response = await api.get(ENDPOINTS.admin.subscription.getStats);
    return response.data;
  },

  // Get user subscription
  getUserSubscription: async (userId: string) => {
    const response = await api.get(ENDPOINTS.admin.subscription.getUserSubscription(userId));
    return response.data;
  },

  // Override access
  overrideAccess: async (userId: string, data: OverrideAccessDto) => {
    const response = await api.post(ENDPOINTS.admin.subscription.overrideAccess(userId), data);
    return response.data;
  },
};

export default adminSubscriptionService;
