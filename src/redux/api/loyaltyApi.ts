import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  BulkTherapistStampConfigDto,
  CreateTherapistStampConfigDto,
  LoyaltyProfile,
  LoyaltyReward,
  Redemption,
  TherapistStampConfig,
  TherapistStampDetail,
  TherapistStampSummary,
  UpdateTherapistStampConfigDto,
} from '@/types/types';

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

// Therapist Stamp System Thunks
// Get all therapist stamp summaries for the authenticated patient
export const getPatientStamps = createAsyncThunk(
  'stamps/getPatientStamps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.stamps);
      return response.data.data as TherapistStampSummary[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get patient stamps');
    }
  },
);

// Get detailed stamp information for a specific therapist
export const getStampDetail = createAsyncThunk(
  'stamps/getStampDetail',
  async (therapistId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.stampDetail(therapistId));
      return response.data.data as TherapistStampDetail;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get stamp detail');
    }
  },
);

// Admin: Get all therapist stamp configurations
export const getAllStampConfigs = createAsyncThunk(
  'stamps/getAllConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.stampConfig);
      return response.data.data as TherapistStampConfig[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get stamp configurations');
    }
  },
);

// Admin: Get stamp configuration for a specific therapist
export const getStampConfigByTherapist = createAsyncThunk(
  'stamps/getConfigByTherapist',
  async (therapistId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId));
      return response.data.data as TherapistStampConfig;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get stamp configuration');
    }
  },
);

// Admin: Create or update stamp configuration
export const createOrUpdateStampConfig = createAsyncThunk(
  'stamps/createOrUpdateConfig',
  async (dto: CreateTherapistStampConfigDto, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.loyalty.stampConfig, dto);
      return response.data.data as TherapistStampConfig;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create/update stamp configuration',
      );
    }
  },
);

// Admin: Update stamp configuration
export const updateStampConfig = createAsyncThunk(
  'stamps/updateConfig',
  async (
    { therapistId, dto }: { therapistId: string; dto: UpdateTherapistStampConfigDto },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId), dto);
      return response.data.data as TherapistStampConfig;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update stamp configuration',
      );
    }
  },
);

// Admin: Delete stamp configuration
export const deleteStampConfig = createAsyncThunk(
  'stamps/deleteConfig',
  async (therapistId: string, { rejectWithValue }) => {
    try {
      await api.delete(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId));
      return therapistId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete stamp configuration',
      );
    }
  },
);

// Admin: Bulk update stamp configurations for all therapists
export const bulkUpdateStampConfigs = createAsyncThunk(
  'stamps/bulkUpdateConfigs',
  async (dto: BulkTherapistStampConfigDto, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.loyalty.stampConfigBulk, dto);
      return response.data.data as { updatedCount: number };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to bulk update stamp configurations',
      );
    }
  },
);
