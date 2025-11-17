import { createSlice } from '@reduxjs/toolkit';

import { TherapistStampConfig, TherapistStampDetail, TherapistStampSummary } from '@/types/types';

import * as loyaltyApi from '../api/loyaltyApi';

interface StampState {
  // Patient-facing data
  stampSummaries: TherapistStampSummary[];
  stampDetail: TherapistStampDetail | null;
  selectedTherapistId: string | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  // Admin-facing data
  configs: TherapistStampConfig[];
  selectedConfig: TherapistStampConfig | null;
  isLoadingConfigs: boolean;
  isUpdatingConfig: boolean;
  configError: string | null;
}

const initialState: StampState = {
  stampSummaries: [],
  stampDetail: null,
  selectedTherapistId: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  configs: [],
  selectedConfig: null,
  isLoadingConfigs: false,
  isUpdatingConfig: false,
  configError: null,
};

const stampSlice = createSlice({
  name: 'stamps',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.configError = null;
    },
    clearStampDetail: (state) => {
      state.stampDetail = null;
      state.selectedTherapistId = null;
    },
    setSelectedTherapistId: (state, action) => {
      state.selectedTherapistId = action.payload;
    },
    clearStamps: (state) => {
      state.stampSummaries = [];
      state.stampDetail = null;
      state.selectedTherapistId = null;
    },
  },
  extraReducers: (builder) => {
    // Get patient stamps
    builder
      .addCase(loyaltyApi.getPatientStamps.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loyaltyApi.getPatientStamps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stampSummaries = action.payload;
      })
      .addCase(loyaltyApi.getPatientStamps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get stamp detail
    builder
      .addCase(loyaltyApi.getStampDetail.pending, (state) => {
        state.isLoadingDetail = true;
        state.error = null;
      })
      .addCase(loyaltyApi.getStampDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.stampDetail = action.payload;
        state.selectedTherapistId = action.payload.therapist.id;
      })
      .addCase(loyaltyApi.getStampDetail.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.error = action.payload as string;
      });

    // Admin: Get all configs
    builder
      .addCase(loyaltyApi.getAllStampConfigs.pending, (state) => {
        state.isLoadingConfigs = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.getAllStampConfigs.fulfilled, (state, action) => {
        state.isLoadingConfigs = false;
        state.configs = action.payload;
      })
      .addCase(loyaltyApi.getAllStampConfigs.rejected, (state, action) => {
        state.isLoadingConfigs = false;
        state.configError = action.payload as string;
      });

    // Admin: Get config by therapist
    builder
      .addCase(loyaltyApi.getStampConfigByTherapist.pending, (state) => {
        state.isLoadingConfigs = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.getStampConfigByTherapist.fulfilled, (state, action) => {
        state.isLoadingConfigs = false;
        state.selectedConfig = action.payload;
      })
      .addCase(loyaltyApi.getStampConfigByTherapist.rejected, (state, action) => {
        state.isLoadingConfigs = false;
        state.configError = action.payload as string;
      });

    // Admin: Create or update config
    builder
      .addCase(loyaltyApi.createOrUpdateStampConfig.pending, (state) => {
        state.isUpdatingConfig = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.createOrUpdateStampConfig.fulfilled, (state, action) => {
        state.isUpdatingConfig = false;
        const index = state.configs.findIndex((c) => c.therapistId === action.payload.therapistId);
        if (index >= 0) {
          state.configs[index] = action.payload;
        } else {
          state.configs.push(action.payload);
        }
        if (state.selectedConfig?.therapistId === action.payload.therapistId) {
          state.selectedConfig = action.payload;
        }
      })
      .addCase(loyaltyApi.createOrUpdateStampConfig.rejected, (state, action) => {
        state.isUpdatingConfig = false;
        state.configError = action.payload as string;
      });

    // Admin: Update config
    builder
      .addCase(loyaltyApi.updateStampConfig.pending, (state) => {
        state.isUpdatingConfig = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.updateStampConfig.fulfilled, (state, action) => {
        state.isUpdatingConfig = false;
        const index = state.configs.findIndex((c) => c.therapistId === action.payload.therapistId);
        if (index >= 0) {
          state.configs[index] = action.payload;
        }
        if (state.selectedConfig?.therapistId === action.payload.therapistId) {
          state.selectedConfig = action.payload;
        }
      })
      .addCase(loyaltyApi.updateStampConfig.rejected, (state, action) => {
        state.isUpdatingConfig = false;
        state.configError = action.payload as string;
      });

    // Admin: Delete config
    builder
      .addCase(loyaltyApi.deleteStampConfig.pending, (state) => {
        state.isUpdatingConfig = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.deleteStampConfig.fulfilled, (state, action) => {
        state.isUpdatingConfig = false;
        state.configs = state.configs.filter((c) => c.therapistId !== action.payload);
        if (state.selectedConfig?.therapistId === action.payload) {
          state.selectedConfig = null;
        }
      })
      .addCase(loyaltyApi.deleteStampConfig.rejected, (state, action) => {
        state.isUpdatingConfig = false;
        state.configError = action.payload as string;
      });

    // Admin: Bulk update configs
    builder
      .addCase(loyaltyApi.bulkUpdateStampConfigs.pending, (state) => {
        state.isUpdatingConfig = true;
        state.configError = null;
      })
      .addCase(loyaltyApi.bulkUpdateStampConfigs.fulfilled, (state) => {
        state.isUpdatingConfig = false;
        // Refresh configs after bulk update
      })
      .addCase(loyaltyApi.bulkUpdateStampConfigs.rejected, (state, action) => {
        state.isUpdatingConfig = false;
        state.configError = action.payload as string;
      });
  },
});

export const { clearError, clearStampDetail, setSelectedTherapistId, clearStamps } =
  stampSlice.actions;
export default stampSlice.reducer;
