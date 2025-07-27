import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Expert } from '@/types/types';

import {
  createBooking,
  favoriteFreelancer as favoriteFreelancerApi,
  getAllFreelancers,
  getFreelancerServices,
  getFreelancerSlots,
  getUserProfile,
  reserveSlot,
} from '../api/overviewApi';

interface FreelancerState {
  experts: Expert[];
  loading: boolean;
  error: string | null;
  slots?: any[];
  slotsPagination?: any;
  userProfile?: any;
  freelancerServices?: any[];
  servicesLoading: boolean;
  profileLoading: boolean;
}

const initialState: FreelancerState = {
  experts: [],
  loading: false,
  error: null,
  slots: [],
  slotsPagination: null,
  userProfile: null,
  freelancerServices: [],
  servicesLoading: false,
  profileLoading: false,
};

export const fetchFreelancers = createAsyncThunk(
  'overview/fetchFreelancers',
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
        return { freelancerId, favorited: res.data.favorited };
      } else {
        return rejectWithValue(res.message || 'Failed to favorite freelancer');
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

export const reserveSlotAction = createAsyncThunk(
  'overview/reserveSlot',
  async (slotId: string, { rejectWithValue }) => {
    try {
      const res = await reserveSlot(slotId);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to reserve slot');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to reserve slot');
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

export const fetchUserProfile = createAsyncThunk(
  'overview/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUserProfile();
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to load user profile');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load user profile');
    }
  },
);

export const fetchFreelancerServices = createAsyncThunk(
  'overview/fetchFreelancerServices',
  async (freelancerId: string, { rejectWithValue }) => {
    try {
      const res = await getFreelancerServices(freelancerId);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      } else {
        return rejectWithValue('Failed to load services');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load services');
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
      .addCase(reserveSlotAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveSlotAction.fulfilled, (state, action) => {
        state.loading = false;
        // Update the slot status in the slots array
        if (state.slots) {
          state.slots = state.slots.map((slot) =>
            slot.id === action.payload.slotId ? { ...slot, status: 'RESERVED' } : slot,
          );
        }
      })
      .addCase(reserveSlotAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bookAppointment.fulfilled, () => {
        // Optionally, you can update state with the new booking info here
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.userProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFreelancerServices.pending, (state) => {
        state.servicesLoading = true;
        state.error = null;
      })
      .addCase(fetchFreelancerServices.fulfilled, (state, action) => {
        state.servicesLoading = false;
        state.freelancerServices = action.payload;
      })
      .addCase(fetchFreelancerServices.rejected, (state, action) => {
        state.servicesLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default overviewSlice.reducer;
