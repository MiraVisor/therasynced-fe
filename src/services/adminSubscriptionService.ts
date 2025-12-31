import {
  PlanType,
  SubscriptionPlan,
  SubscriptionPlanType,
  SubscriptionStatus,
} from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface UpdateSubscriptionPlanDto {
  displayName?: string;
  description?: string;
  price?: number;
  stripePriceId?: string;
  stripeProductId?: string;
  maxSlots?: number;
  commissionRate?: number;
  features?: string[];
  searchPriority?: number;
  canToggleReviews?: boolean;
  analyticsAccess?: boolean;
  monthlyReportEnabled?: boolean;
  reminderClientEnabled?: boolean;
  reminderFreelancerEnabled?: boolean;
  notifyOnBooking?: boolean;
  isActive?: boolean;
}

// Admin subscription management types
export interface AdminSubscriptionFilters {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  plan?: SubscriptionPlanType;
  search?: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
  cancelImmediately?: boolean;
}

export interface UpdateSubscriptionPlanRequest {
  planType: SubscriptionPlanType;
}

export interface TrialAccessRequest {
  grant: boolean;
  reason?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'FREELANCER';
    isActive: boolean;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SubscriptionListResponse {
  success: boolean;
  data: UserSubscription[];
  pagination: PaginationMeta;
}

export interface SubscriptionDetailResponse {
  success: boolean;
  data: UserSubscription;
}

export interface SubscriptionActionResponse {
  success: boolean;
  message: string;
  data: UserSubscription;
}

const adminSubscriptionService = {
  // Get all subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<{ success: boolean; data: SubscriptionPlan[] }>(
      ENDPOINTS.admin.subscription.getPlans,
    );
    return response.data.data;
  },

  // Update subscription plan configuration
  updatePlan: async (
    planType: PlanType,
    data: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> => {
    const response = await api.patch<{ success: boolean; data: SubscriptionPlan }>(
      ENDPOINTS.admin.subscription.updatePlan(planType),
      data,
    );
    return response.data.data;
  },

  // Get all user subscriptions with filters
  getAllUserSubscriptions: async (
    filters?: AdminSubscriptionFilters,
  ): Promise<SubscriptionListResponse> => {
    const response = await api.get<SubscriptionListResponse>(
      ENDPOINTS.admin.subscription.getAllUserSubscriptions,
      {
        params: filters,
      },
    );
    return response.data;
  },

  // Get specific user subscription
  getUserSubscription: async (userId: string): Promise<SubscriptionDetailResponse> => {
    const response = await api.get<SubscriptionDetailResponse>(
      ENDPOINTS.admin.subscription.getUserSubscription(userId),
    );
    return response.data;
  },

  // Cancel user subscription
  cancelSubscription: async (
    userId: string,
    data: CancelSubscriptionRequest,
  ): Promise<SubscriptionActionResponse> => {
    const response = await api.post<SubscriptionActionResponse>(
      ENDPOINTS.admin.subscription.cancelSubscription(userId),
      data,
    );
    return response.data;
  },

  // Update user subscription plan
  updateUserPlan: async (
    userId: string,
    data: UpdateSubscriptionPlanRequest,
  ): Promise<SubscriptionActionResponse> => {
    const response = await api.patch<SubscriptionActionResponse>(
      ENDPOINTS.admin.subscription.updateUserPlan(userId),
      data,
    );
    return response.data;
  },

  // Resume canceled subscription
  resumeSubscription: async (userId: string): Promise<SubscriptionActionResponse> => {
    const response = await api.post<SubscriptionActionResponse>(
      ENDPOINTS.admin.subscription.resumeSubscription(userId),
    );
    return response.data;
  },

  // Grant/revoke trial access
  manageTrialAccess: async (
    userId: string,
    data: TrialAccessRequest,
  ): Promise<SubscriptionActionResponse> => {
    const response = await api.post<SubscriptionActionResponse>(
      ENDPOINTS.admin.subscription.manageTrialAccess(userId),
      data,
    );
    return response.data;
  },
};

export default adminSubscriptionService;
