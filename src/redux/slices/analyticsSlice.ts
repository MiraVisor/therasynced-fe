import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { FreelancerAnalyticsResponse } from '@/services/freelancerService';
import freelancerService from '@/services/freelancerService';

interface AnalyticsState {
  data: FreelancerAnalyticsResponse | null;
  loading: boolean;
  backgroundRefreshing: boolean;
  initialLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  backgroundRefreshing: false,
  initialLoading: false,
  error: null,
  lastFetched: null,
};

// Thunk for fetching analytics data
export const fetchFreelancerAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (options: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const data = await freelancerService.getAnalytics();
      return { data, silent: options.silent };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      return rejectWithValue(errorMessage);
    }
  },
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalyticsData: (state) => {
      state.data = null;
      state.loading = false;
      state.backgroundRefreshing = false;
      state.initialLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancerAnalytics.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.data) {
          // If we have data and it's a silent refresh, use background loading
          state.backgroundRefreshing = true;
        } else {
          // Otherwise, show the main loading state
          state.loading = true;
          if (!state.data) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(fetchFreelancerAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.data = action.payload.data;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchFreelancerAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAnalyticsData } = analyticsSlice.actions;

export default analyticsSlice.reducer;
