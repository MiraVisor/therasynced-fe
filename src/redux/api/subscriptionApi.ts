import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  CancelSubscriptionDto,
  PlanType,
  Subscription,
  SubscriptionPlan,
  UpdateSubscriptionDto,
} from '@/types/types';

// Get all available subscription plans
export const getSubscriptionPlans = createAsyncThunk(
  'subscription/getPlans',
  async (options: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.subscription.plans);
      return { data: response.data.data as SubscriptionPlan[], silent: options.silent };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get subscription plans');
    }
  },
);

// Get current subscription
export const getMySubscription = createAsyncThunk(
  'subscription/getMySubscription',
  async (options: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.subscription.mySubscription);
      return { data: response.data.data as Subscription, silent: options.silent };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get subscription');
    }
  },
);

// Create new subscription
export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (planType: PlanType, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.subscription.subscribe, { planType });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  },
);

// Update subscription (upgrade/downgrade)
export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async (data: UpdateSubscriptionDto, { rejectWithValue }) => {
    try {
      const response = await api.put(ENDPOINTS.subscription.update, data);
      return response.data.data as Subscription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  },
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (data: CancelSubscriptionDto = {}, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.subscription.cancel, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  },
);

// Resume cancelled subscription
export const resumeSubscription = createAsyncThunk(
  'subscription/resume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.subscription.resume);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume subscription');
    }
  },
);

// Get billing portal URL
export const getBillingPortal = createAsyncThunk(
  'subscription/getBillingPortal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.subscription.billingPortal);
      return response.data.data.url as string;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get billing portal URL');
    }
  },
);

// Create checkout session
export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckout',
  async (planType: PlanType, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.subscription.checkout, { planType });
      // Backend returns { sessionUrl, sessionId, clientSecret }
      // clientSecret is needed for embedded checkout
      return response.data.data as {
        sessionUrl: string;
        sessionId: string;
        clientSecret?: string;
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create checkout session');
    }
  },
);

// Verify checkout session after Stripe payment
export const verifyCheckoutSession = createAsyncThunk(
  'subscription/verifyCheckout',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.subscription.verifyCheckout, {
        params: { session_id: sessionId },
      });
      return response.data.data as Subscription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify checkout session');
    }
  },
);
