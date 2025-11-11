import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getFreelancerDashboardOverview } from '@/redux/api/dashboardApi';
import { FreelancerDashboardOverview } from '@/types/types';

interface FreelancerDashboardState {
  data: FreelancerDashboardOverview | null;
  loading: boolean;
  backgroundRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: FreelancerDashboardState = {
  data: null,
  loading: false,
  backgroundRefreshing: false,
  error: null,
  lastFetched: null,
};

// Thunk for fetching dashboard data
export const fetchFreelancerDashboard = createAsyncThunk(
  'freelancerDashboard/fetch',
  async (options: { silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getFreelancerDashboardOverview();
      if (response.success && response.data) {
        return { data: response.data, silent: options.silent };
      } else {
        return rejectWithValue('Failed to load dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      return rejectWithValue(errorMessage);
    }
  },
);

const freelancerDashboardSlice = createSlice({
  name: 'freelancerDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.data = null;
      state.loading = false;
      state.backgroundRefreshing = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancerDashboard.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.data) {
          // If we have data and it's a silent refresh, use background loading
          state.backgroundRefreshing = true;
        } else {
          // Otherwise, show the main loading state
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchFreelancerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.data = action.payload.data;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchFreelancerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDashboardData } = freelancerDashboardSlice.actions;

export default freelancerDashboardSlice.reducer;
