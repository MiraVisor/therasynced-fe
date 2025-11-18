import { PlanType, SubscriptionPlan } from '@/types/types';

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
};

export default adminSubscriptionService;
