import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Expert } from '@/types/types';

import {
  createBooking,
  favoriteFreelancer as favoriteFreelancerApi,
  getAllFreelancers,
  getFreelancerSlots,
} from '../api/overviewApi';

interface FreelancerState {
  experts: Expert[];
  loading: boolean;
  error: string | null;
  slots?: any[];
  slotsPagination?: any;
}

const initialState: FreelancerState = {
  experts: [],
  loading: false,
  error: null,
  slots: [],
  slotsPagination: undefined,
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

export const favoriteFreelancer = createAsyncThunk(
  'overview/favoriteFreelancer',
  async (freelancerId: string, { rejectWithValue }) => {
    try {
      const res = await favoriteFreelancerApi(freelancerId);
      if (res.success) {
        // Return both id and favorited status from API
        return { freelancerId, favorited: res.data.favorited };
      } else {
        return rejectWithValue('Failed to favorite freelancer');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to favorite freelancer');
    }
  },
);

export const fetchFreelancerSlots = createAsyncThunk(
  'overview/fetchFreelancerSlots',
  async (
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      freelancerId?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getFreelancerSlots(params);
      if (res.success && Array.isArray(res.data)) {
        return {
          slots: res.data,
          pagination: res.pagination,
        };
      } else {
        return rejectWithValue('Failed to load slots');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load slots');
    }
  },
);

export const bookAppointment = createAsyncThunk(
  'overview/bookAppointment',
  async (
    data: {
      slotId: string;
      serviceIds?: string[];
      clientId?: string;
      clientAddress?: string;
      notes?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await createBooking(data);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to book appointment');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to book appointment');
    }
  },
);

const overviewSlice = createSlice({
  name: 'overview',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.experts = action.payload;
      })
      .addCase(fetchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(favoriteFreelancer.fulfilled, (state, action) => {
        // Set isFavorite according to API response
        state.experts = state.experts.map((expert) =>
          expert.id === action.payload.freelancerId
            ? { ...expert, isFavorite: action.payload.favorited }
            : expert,
        );
      })
      .addCase(fetchFreelancerSlots.fulfilled, (state, action) => {
        state.slots = action.payload.slots;
        state.slotsPagination = action.payload.pagination;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        // Optionally, you can update state with the new booking info here
      });
  },
});

export default overviewSlice.reducer;
