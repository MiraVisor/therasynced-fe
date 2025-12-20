import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create subscription');
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update subscription');
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel subscription');
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription resumed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to resume subscription');
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
    mutationFn: (planType: PlanType) => api.post(ENDPOINTS.subscription.checkout, { planType }),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create checkout session');
    },
  });
};

/**
 * Hook to verify checkout session
 */
export const useVerifyCheckoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      api.get(ENDPOINTS.subscription.verifyCheckout, {
        params: { session_id: sessionId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Payment verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to verify checkout session');
    },
  });
};
