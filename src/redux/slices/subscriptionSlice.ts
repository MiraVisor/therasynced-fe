import { createSlice } from '@reduxjs/toolkit';

import { Subscription, SubscriptionPlan } from '@/types/types';

import * as subscriptionApi from '../api/subscriptionApi';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  billingPortalUrl: string | null;
  isLoading: boolean;
  isSubscribing: boolean;
  isUpdating: boolean;
  isCanceling: boolean;
  isCreatingCheckout: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  billingPortalUrl: null,
  isLoading: false,
  isSubscribing: false,
  isUpdating: false,
  isCanceling: false,
  isCreatingCheckout: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubscription: (state) => {
      state.currentSubscription = null;
      state.plans = [];
      state.billingPortalUrl = null;
    },
    setBillingPortalUrl: (state, action) => {
      state.billingPortalUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get subscription plans
    builder
      .addCase(subscriptionApi.getSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(subscriptionApi.getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(subscriptionApi.getSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current subscription
    builder
      .addCase(subscriptionApi.getMySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(subscriptionApi.getMySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(subscriptionApi.getMySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create subscription
    builder
      .addCase(subscriptionApi.createSubscription.pending, (state) => {
        state.isSubscribing = true;
        state.error = null;
      })
      .addCase(subscriptionApi.createSubscription.fulfilled, (state, action) => {
        state.isSubscribing = false;
        state.currentSubscription = action.payload.subscription;
      })
      .addCase(subscriptionApi.createSubscription.rejected, (state, action) => {
        state.isSubscribing = false;
        state.error = action.payload as string;
      });

    // Update subscription
    builder
      .addCase(subscriptionApi.updateSubscription.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(subscriptionApi.updateSubscription.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentSubscription = action.payload;
      })
      .addCase(subscriptionApi.updateSubscription.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Cancel subscription
    builder
      .addCase(subscriptionApi.cancelSubscription.pending, (state) => {
        state.isCanceling = true;
        state.error = null;
      })
      .addCase(subscriptionApi.cancelSubscription.fulfilled, (state) => {
        state.isCanceling = false;
        if (state.currentSubscription) {
          state.currentSubscription.cancelAtPeriodEnd = true;
        }
      })
      .addCase(subscriptionApi.cancelSubscription.rejected, (state, action) => {
        state.isCanceling = false;
        state.error = action.payload as string;
      });

    // Resume subscription
    builder
      .addCase(subscriptionApi.resumeSubscription.fulfilled, (state) => {
        if (state.currentSubscription) {
          state.currentSubscription.cancelAtPeriodEnd = false;
        }
      })
      .addCase(subscriptionApi.resumeSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get billing portal
    builder.addCase(subscriptionApi.getBillingPortal.fulfilled, (state, action) => {
      state.billingPortalUrl = action.payload;
    });

    // Create checkout session
    builder
      .addCase(subscriptionApi.createCheckoutSession.pending, (state) => {
        state.isCreatingCheckout = true;
        state.error = null;
      })
      .addCase(subscriptionApi.createCheckoutSession.fulfilled, (state) => {
        state.isCreatingCheckout = false;
      })
      .addCase(subscriptionApi.createCheckoutSession.rejected, (state, action) => {
        state.isCreatingCheckout = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSubscription, setBillingPortalUrl } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
