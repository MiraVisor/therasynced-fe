import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Expert } from '@/types/types';

import {
  createBooking,
  favoriteFreelancer as favoriteFreelancerApi,
  getAllFreelancers,
  getFreelancerServices,
  getFreelancerSlots,
} from '../api/overviewApi';
import { getProfile } from '../api/profileApi';

interface FreelancerState {
  experts: Expert[];
  loading: boolean;
  error: string | null;
  slots?: any[];
  slotsPagination?: any;
  socketConnected: boolean;
  reservedSlots: string[]; // Track reserved slot IDs
  // Pagination state
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  loadingMore: boolean;
}

const initialState: FreelancerState = {
  experts: [],
  loading: false,
  error: null,
  slots: [],
  slotsPagination: undefined,
  socketConnected: false,
  reservedSlots: [],
  pagination: null,
  loadingMore: false,
};

export const fetchFreelancers = createAsyncThunk(
  'freelancer/fetchAll',
  async (
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllFreelancers(params);
      if (res.success && Array.isArray(res.data)) {
        return {
          data: res.data,
          pagination: res.pagination,
        };
      } else {
        return rejectWithValue('Failed to load freelancers');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load freelancers');
    }
  },
);

export const loadMoreFreelancers = createAsyncThunk(
  'freelancer/loadMore',
  async (
    params: { page: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllFreelancers(params);
      if (res.success && Array.isArray(res.data)) {
        return {
          data: res.data,
          pagination: res.pagination,
        };
      } else {
        return rejectWithValue('Failed to load more freelancers');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load more freelancers');
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
      const res = reserveSlot(slotId);
      return res;
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
      const res = await getProfile();
      return res;
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
  reducers: {
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    updateSlotStatus: (state, action) => {
      const { slotId, status, isBooked, statusInfo } = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) =>
          slot.id === slotId ? { ...slot, status, isBooked, statusInfo } : slot,
        );
      }
    },
    updateMultipleSlots: (state, action) => {
      const updatedSlots = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) => {
          const updatedSlot = updatedSlots.find((s: any) => s.id === slot.id);
          return updatedSlot ? { ...slot, ...updatedSlot } : slot;
        });
      }
    },
    reserveSlot: (state, action) => {
      const { slotId, reserved, statusInfo } = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                isBooked: false, // Reservations are not booked, they're just reserved
                status: reserved ? 'RESERVED' : 'AVAILABLE',
                statusInfo: statusInfo || {
                  status: reserved ? 'RESERVED' : 'AVAILABLE',
                  isAvailable: !reserved,
                  isReserved: reserved,
                  isBooked: false,
                  canBeReserved: !reserved,
                  statusMessage: reserved ? 'Reserved by you' : 'Available for booking',
                },
              }
            : slot,
        );
      }

      // Track reserved slots
      if (reserved) {
        if (!state.reservedSlots.includes(slotId)) {
          state.reservedSlots.push(slotId);
        }
      } else {
        state.reservedSlots = state.reservedSlots.filter((id) => id !== slotId);
      }
    },
    confirmSlotReservation: (state, action) => {
      const { slotId, statusInfo } = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                status: 'RESERVED',
                isBooked: false, // Reservations are not booked
                statusInfo: statusInfo || {
                  status: 'RESERVED',
                  isAvailable: false,
                  isReserved: true,
                  isBooked: false,
                  canBeReserved: false,
                  statusMessage: 'Reserved by you',
                },
              }
            : slot,
        );
      }

      // Add to reserved slots if not already there
      if (!state.reservedSlots.includes(slotId)) {
        state.reservedSlots.push(slotId);
      }
    },
    releaseSlotReservation: (state, action) => {
      const { slotId } = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) =>
          slot.id === slotId ? { ...slot, status: 'AVAILABLE', isBooked: false } : slot,
        );
      }

      // Remove from reserved slots
      state.reservedSlots = state.reservedSlots.filter((id) => id !== slotId);
    },
    clearReservedSlots: (state) => {
      state.reservedSlots = [];
    },
    removeSlotFromAvailable: (state, action) => {
      const { slotId } = action.payload;
      if (state.slots) {
        state.slots = state.slots.map((slot) =>
          slot.id === slotId ? { ...slot, isBooked: true, status: 'BOOKED' } : slot,
        );
      }
      // Remove from reserved slots if it was reserved
      state.reservedSlots = state.reservedSlots.filter((id) => id !== slotId);
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
        state.experts = action.payload.data;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadMoreFreelancers.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreFreelancers.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.experts = [...state.experts, ...action.payload.data];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(loadMoreFreelancers.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(favoriteFreelancer.fulfilled, (state, action) => {
        // Set isFavorite according to API response
        state.experts = state.experts.map((expert: Expert) =>
          expert.id === action.payload.freelancerId
            ? { ...expert, isFavorite: action.payload.favorited }
            : expert,
        );
      })
      .addCase(fetchFreelancerSlots.fulfilled, (state, action) => {
        state.slots = action.payload.slots;
        state.slotsPagination = action.payload.pagination;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update slots to mark the booked slot as unavailable
        if (state.slots) {
          state.slots = state.slots.map((slot) =>
            slot.id === action.payload.slotId
              ? { ...slot, isBooked: true, status: 'BOOKED' }
              : slot,
          );
        }

        // Remove from reserved slots if it was reserved
        state.reservedSlots = state.reservedSlots.filter((id) => id !== action.payload.slotId);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSocketConnected,
  updateSlotStatus,
  updateMultipleSlots,
  reserveSlot,
  confirmSlotReservation,
  releaseSlotReservation,
  clearReservedSlots,
  removeSlotFromAvailable,
} = overviewSlice.actions;

export default overviewSlice.reducer;
