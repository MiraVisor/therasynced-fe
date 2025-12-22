import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { getApiErrorMessage } from '@/types/common';
import {
  CancelSubscriptionDto,
  PlanType,
  Subscription,
  SubscriptionPlan,
  UpdateSubscriptionDto,
} from '@/types/types';

/**
 * Hook to fetch subscription plans
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.subscription.plans);
      return response.data.data as SubscriptionPlan[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch current subscription
 */
export const useMySubscription = () => {
  return useQuery({
    queryKey: ['subscription', 'my'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.subscription.mySubscription);
      return response.data.data as Subscription;
    },
  });
};

/**
 * Hook to create subscription
 */
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planType: PlanType) => api.post(ENDPOINTS.subscription.subscribe, { planType }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create subscription');
    },
  });
};

/**
 * Hook to update subscription
 */
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubscriptionDto) => api.put(ENDPOINTS.subscription.update, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update subscription');
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionDto = {}) => api.post(ENDPOINTS.subscription.cancel, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to cancel subscription');
    },
  });
};

/**
 * Hook to resume subscription
 */
export const useResumeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(ENDPOINTS.subscription.resume),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription resumed successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to resume subscription');
    },
  });
};

/**
 * Hook to get billing portal URL
 */
export const useBillingPortal = () => {
  return useQuery({
    queryKey: ['subscription', 'billingPortal'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.subscription.billingPortal);
      return response.data.data.url as string;
    },
    enabled: false, // Only fetch when explicitly called via refetch
  });
};

/**
 * Hook to create checkout session
 */
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (planType: PlanType) => {
      const response = await api.post<{
        success: boolean;
        data: { clientSecret?: string; sessionUrl?: string };
      }>(ENDPOINTS.subscription.checkout, { planType });
      return response.data;
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to create checkout session');
    },
  });
};

/**
 * Hook to verify checkout session
 */
export const useVerifyCheckoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.get<{ success: boolean; data: Subscription }>(
        ENDPOINTS.subscription.verifyCheckout,
        {
          params: { session_id: sessionId },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Payment verified successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to verify checkout session');
    },
  });
};
