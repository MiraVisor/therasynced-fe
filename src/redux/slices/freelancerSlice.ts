import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Freelancer } from '@/types/types';

import {
  favoriteFreelancer as favoriteFreelancerApi,
  getAllFreelancers,
} from '../api/freelancerApi';

interface FreelancerState {
  freelancers: Freelancer[];
  favoriteFreelancers: Freelancer[];
  loading: boolean;
  error: string | null;
}

const initialState: FreelancerState = {
  freelancers: [],
  favoriteFreelancers: [],
  loading: false,
  error: null,
};

export const fetchFreelancers = createAsyncThunk(
  'freelancer/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllFreelancers();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      } else {
        return rejectWithValue('Failed to load freelancers');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load freelancers');
    }
  },
);

export const toggleFavoriteFreelancer = createAsyncThunk(
  'freelancer/toggleFavorite',
  async (freelancerId: string, { rejectWithValue }) => {
    try {
      const res = await favoriteFreelancerApi(freelancerId);
      if (res.success) {
        return { freelancerId, favorited: res.data.favorited };
      } else {
        return rejectWithValue('Failed to toggle favorite');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to toggle favorite');
    }
  },
);

const freelancerSlice = createSlice({
  name: 'freelancer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.freelancers = action.payload;
        // Update favorite freelancers
        state.favoriteFreelancers = action.payload.filter((f: Freelancer) => f.isFavorite);
      })
      .addCase(fetchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleFavoriteFreelancer.fulfilled, (state, action) => {
        const { freelancerId, favorited } = action.payload;

        // Update freelancer in main list
        state.freelancers = state.freelancers.map((freelancer) =>
          freelancer.id === freelancerId ? { ...freelancer, isFavorite: favorited } : freelancer,
        );

        // Update favorite freelancers list
        if (favorited) {
          const freelancer = state.freelancers.find((f) => f.id === freelancerId);
          if (freelancer && !state.favoriteFreelancers.find((f) => f.id === freelancerId)) {
            state.favoriteFreelancers.push(freelancer);
          }
        } else {
          state.favoriteFreelancers = state.favoriteFreelancers.filter(
            (f) => f.id !== freelancerId,
          );
        }
      });
  },
});

export const { clearError } = freelancerSlice.actions;

export default freelancerSlice.reducer;
