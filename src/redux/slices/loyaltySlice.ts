import { createSlice } from '@reduxjs/toolkit';

import { LoyaltyProfile, LoyaltyReward, Redemption } from '@/types/types';

import * as loyaltyApi from '../api/loyaltyApi';

interface LoyaltyState {
  profile: LoyaltyProfile | null;
  rewards: LoyaltyReward[];
  redemptions: Redemption[];
  isLoading: boolean;
  isRedeeming: boolean;
  error: string | null;
}

const initialState: LoyaltyState = {
  profile: null,
  rewards: [],
  redemptions: [],
  isLoading: false,
  isRedeeming: false,
  error: null,
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLoyalty: (state) => {
      state.profile = null;
      state.rewards = [];
      state.redemptions = [];
    },
  },
  extraReducers: (builder) => {
    // Get loyalty profile
    builder
      .addCase(loyaltyApi.getLoyaltyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loyaltyApi.getLoyaltyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(loyaltyApi.getLoyaltyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get rewards
    builder
      .addCase(loyaltyApi.getLoyaltyRewards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loyaltyApi.getLoyaltyRewards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rewards = action.payload;
      })
      .addCase(loyaltyApi.getLoyaltyRewards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Redeem reward
    builder
      .addCase(loyaltyApi.redeemReward.pending, (state) => {
        state.isRedeeming = true;
        state.error = null;
      })
      .addCase(loyaltyApi.redeemReward.fulfilled, (state) => {
        state.isRedeeming = false;
      })
      .addCase(loyaltyApi.redeemReward.rejected, (state, action) => {
        state.isRedeeming = false;
        state.error = action.payload as string;
      });

    // Get redemption history
    builder
      .addCase(loyaltyApi.getRedemptionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loyaltyApi.getRedemptionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.redemptions = action.payload;
      })
      .addCase(loyaltyApi.getRedemptionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLoyalty } = loyaltySlice.actions;
export default loyaltySlice.reducer;
