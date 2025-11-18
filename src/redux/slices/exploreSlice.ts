import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getAllFavoriteFreelancers,
  getPatientBookings,
  getRecentFavoriteFreelancer,
} from '../api/exploreApi';

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

export const fetchAllFavoriteFreelancers = createAsyncThunk(
  'explore/fetchAllFavoriteFreelancers',
  async (options: { silent?: boolean; name?: string } = {}, { rejectWithValue }) => {
    try {
      const { silent, ...apiParams } = options;
      const response = await getAllFavoriteFreelancers(apiParams);
      console.log(response.data);
      return { data: response.data, silent };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch favorite freelancers');
    }
  },
);

export const fetchExplorePatientBookings = createAsyncThunk(
  'explore/fetchExplorePatientBookings',
  async (params: { date?: string; silent?: boolean } = {}, { rejectWithValue }) => {
    try {
      const { silent, ...apiParams } = params;
      const response = await getPatientBookings(apiParams.date);
      return { data: response.data, silent };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch bookings');
    }
  },
);

const initialState = {
  favorite: null as any, // allow null or API object
  favorites: [] as any[], // array of favorite freelancers
  loading: false,
  backgroundRefreshing: false,
  initialLoading: false,
  error: null as string | null,
  bookings: [],
  bookingsLoading: false,
  bookingsBackgroundRefreshing: false,
  bookingsInitialLoading: false,
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
      .addCase(fetchAllFavoriteFreelancers.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.favorites.length > 0) {
          state.backgroundRefreshing = true;
        } else {
          state.loading = true;
          if (state.favorites.length === 0) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(fetchAllFavoriteFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.favorites = action.payload.data ?? action.payload ?? [];
      })
      .addCase(fetchAllFavoriteFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error?.message ?? 'Unknown error');
        if (!state.favorites || state.favorites.length === 0) {
          state.favorites = [];
        }
      })
      .addCase(fetchExplorePatientBookings.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.bookings.length > 0) {
          state.bookingsBackgroundRefreshing = true;
        } else {
          state.bookingsLoading = true;
          if (state.bookings.length === 0) {
            state.bookingsInitialLoading = true;
          }
        }
      })
      .addCase(fetchExplorePatientBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsBackgroundRefreshing = false;
        state.bookingsInitialLoading = false;
        state.bookings = action.payload.data ?? action.payload ?? [];
      })
      .addCase(fetchExplorePatientBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsBackgroundRefreshing = false;
        state.bookingsInitialLoading = false;
        if (!state.bookings || state.bookings.length === 0) {
          state.bookings = [];
        }
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error?.message ?? 'Unknown error');
      });
  },
});

export default exploreSlice.reducer;
