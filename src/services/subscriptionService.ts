import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import type { SubscriptionPlan, SubscriptionPlansResponse } from '@/types/subscription';

/**
 * Public service to fetch subscription plans (no authentication required)
 */
export const getPublicSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await api.get<SubscriptionPlansResponse>(ENDPOINTS.subscription.plans);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};
