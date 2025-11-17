import { createSlice } from '@reduxjs/toolkit';

import { Subscription, SubscriptionPlan } from '@/types/types';

import {
  cancelSubscription,
  createCheckoutSession,
  createSubscription,
  getBillingPortal,
  getMySubscription,
  getSubscriptionPlans,
  resumeSubscription,
  updateSubscription,
  verifyCheckoutSession,
} from '../api/subscriptionApi';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  billingPortalUrl: string | null;
  isLoading: boolean;
  backgroundRefreshing: boolean;
  initialLoading: boolean;
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
  backgroundRefreshing: false,
  initialLoading: false,
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
      .addCase(getSubscriptionPlans.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.plans.length > 0) {
          state.backgroundRefreshing = true;
        } else {
          state.isLoading = true;
          if (state.plans.length === 0) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.plans = action.payload.data || action.payload;
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      });

    // Get current subscription
    builder
      .addCase(getMySubscription.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.currentSubscription) {
          state.backgroundRefreshing = true;
        } else {
          state.isLoading = true;
          if (!state.currentSubscription) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(getMySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.currentSubscription = action.payload.data || action.payload;
      })
      .addCase(getMySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      });

    // Create subscription
    builder
      .addCase(createSubscription.pending, (state) => {
        state.isSubscribing = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isSubscribing = false;
        state.currentSubscription = action.payload.subscription;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isSubscribing = false;
        state.error = action.payload as string;
      });

    // Update subscription
    builder
      .addCase(updateSubscription.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentSubscription = action.payload;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Cancel subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.isCanceling = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isCanceling = false;
        if (state.currentSubscription) {
          state.currentSubscription.cancelAtPeriodEnd = true;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isCanceling = false;
        state.error = action.payload as string;
      });

    // Resume subscription
    builder
      .addCase(resumeSubscription.fulfilled, (state) => {
        if (state.currentSubscription) {
          state.currentSubscription.cancelAtPeriodEnd = false;
        }
      })
      .addCase(resumeSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get billing portal
    builder.addCase(getBillingPortal.fulfilled, (state, action) => {
      state.billingPortalUrl = action.payload;
    });

    // Create checkout session
    builder
      .addCase(createCheckoutSession.pending, (state) => {
        state.isCreatingCheckout = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.isCreatingCheckout = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.isCreatingCheckout = false;
        state.error = action.payload as string;
      });

    // Verify checkout session
    builder
      .addCase(verifyCheckoutSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyCheckoutSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
        state.error = null;
      })
      .addCase(verifyCheckoutSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSubscription, setBillingPortalUrl } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
