import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { LoyaltyProfile, LoyaltyReward, Redemption } from '@/types/types';

// Get loyalty profile
export const getLoyaltyProfile = createAsyncThunk(
  'loyalty/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.profile);
      return response.data.data as LoyaltyProfile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get loyalty profile');
    }
  },
);

// Get available rewards
export const getLoyaltyRewards = createAsyncThunk(
  'loyalty/getRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.rewards);
      return response.data.data as LoyaltyReward[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get rewards');
    }
  },
);

// Redeem a reward
export const redeemReward = createAsyncThunk(
  'loyalty/redeem',
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.loyalty.redeem, { rewardId });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to redeem reward');
    }
  },
);

// Get redemption history
export const getRedemptionHistory = createAsyncThunk(
  'loyalty/getRedemptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.redemptions);
      return response.data.data as Redemption[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get redemption history');
    }
  },
);
