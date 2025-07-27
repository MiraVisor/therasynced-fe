import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getPatientBookings, getRecentFavoriteFreelancer } from '../api/exploreApi';

export const fetchRecentFavoriteFreelancer = createAsyncThunk(
  'explore/fetchRecentFavoriteFreelancer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRecentFavoriteFreelancer();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch favorite freelancer');
    }
  },
);

export const fetchExplorePatientBookings = createAsyncThunk(
  'explore/fetchExplorePatientBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPatientBookings();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch bookings');
    }
  },
);

const initialState = {
  favorite: null as any, // allow null or API object
  loading: false,
  error: null as string | null,
  bookings: [],
  bookingsLoading: false,
};

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentFavoriteFreelancer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentFavoriteFreelancer.fulfilled, (state, action) => {
        state.loading = false;
        state.favorite = action.payload ?? null;
      })
      .addCase(fetchRecentFavoriteFreelancer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error?.message ?? 'Unknown error');
        state.favorite = null;
      })
      .addCase(fetchExplorePatientBookings.pending, (state) => {
        state.bookingsLoading = true;
      })
      .addCase(fetchExplorePatientBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload ?? [];
      })
      .addCase(fetchExplorePatientBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = [];
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error?.message ?? 'Unknown error');
      });
  },
});

export default exploreSlice.reducer;
