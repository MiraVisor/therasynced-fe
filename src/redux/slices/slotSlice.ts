import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CreateSlotsDto, PaginationDto, ReserveSlotDto, Slot, UpdateSlotDto } from '@/types/types';

import * as slotApi from '../api/slotApi';

interface SlotState {
  slots: Slot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isReserving: boolean;
  error: string | null;
}

const initialState: SlotState = {
  slots: [],
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isReserving: false,
  error: null,
};

export const createSlot = createAsyncThunk(
  'slot/createSlot',
  async (data: CreateSlotsDto, { rejectWithValue }) => {
    try {
      const response = await slotApi.createSlot(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create slot');
    }
  },
);

export const fetchSlots = createAsyncThunk(
  'slot/fetchSlots',
  async (params: PaginationDto, { rejectWithValue }) => {
    try {
      const response = await slotApi.getSlots(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch slots');
    }
  },
);

export const updateSlot = createAsyncThunk(
  'slot/updateSlot',
  async (data: UpdateSlotDto, { rejectWithValue }) => {
    try {
      const response = await slotApi.updateSlot(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update slot');
    }
  },
);

export const deleteSlot = createAsyncThunk(
  'slot/deleteSlot',
  async (slotId: string, { rejectWithValue }) => {
    try {
      const response = await slotApi.deleteSlot(slotId);
      return { slotId, data: response };
    } catch (error: any) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Failed to delete slot',
        slotId,
      });
    }
  },
);

export const reserveSlot = createAsyncThunk(
  'slot/reserveSlot',
  async (data: ReserveSlotDto, { rejectWithValue }) => {
    try {
      const response = await slotApi.reserveSlot(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reserve slot');
    }
  },
);

export const checkExpiredReservations = createAsyncThunk(
  'slot/checkExpiredReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await slotApi.checkExpiredReservations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check expired reservations',
      );
    }
  },
);

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create slot
      .addCase(createSlot.pending, (state, action) => {
        state.isCreating = true;
        state.error = null;

        // Optimistic update - add temporary slots immediately
        const tempSlots = action.meta.arg.slots.map((slot, index) => ({
          id: `temp-${Date.now()}-${index}`,
          freelancerId: '', // Will be filled by backend
          locationType: action.meta.arg.locationType,
          location: action.meta.arg.locationId
            ? {
                id: action.meta.arg.locationId,
                name: 'Loading...',
                address: 'Loading...',
                type: 'OFFICE' as const,
                additionalFee: 0,
              }
            : undefined,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: action.meta.arg.duration,
          basePrice: action.meta.arg.basePrice,
          status: 'AVAILABLE' as const,
          notes: action.meta.arg.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        state.slots.unshift(...tempSlots);
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.isCreating = false;
        // Replace temporary slots with real ones from backend
        const tempIds = state.slots
          .filter((slot) => slot.id.startsWith('temp-'))
          .map((slot) => slot.id);
        state.slots = state.slots.filter((slot) => !tempIds.includes(slot.id));
        state.slots.unshift(...action.payload);
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
        // Remove temporary slots on error
        state.slots = state.slots.filter((slot) => !slot.id.startsWith('temp-'));
      })
      // Fetch slots
      .addCase(fetchSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.slots = action.payload.data;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update slot
      .addCase(updateSlot.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSlot.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.slots.findIndex((slot) => slot.id === action.payload.id);
        if (index !== -1) {
          state.slots[index] = action.payload;
        }
      })
      .addCase(updateSlot.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete slot
      .addCase(deleteSlot.pending, (state, action) => {
        // Optimistic update - remove slot immediately
        const slotId = action.meta.arg;
        state.slots = state.slots.filter((slot) => slot.id !== slotId);
        state.error = null;
      })
      .addCase(deleteSlot.fulfilled, (state) => {
        // Success - slot already removed optimistically
        state.error = null;
      })
      .addCase(deleteSlot.rejected, (state, action) => {
        // Rollback - add the slot back if deletion failed
        const payload = action.payload as { error: string; slotId: string };
        state.error = payload.error;
        // Note: We would need to store the original slot data to restore it
        // For now, we'll let the user refresh to see the slot again
      })
      // Reserve slot
      .addCase(reserveSlot.pending, (state) => {
        state.isReserving = true;
        state.error = null;
      })
      .addCase(reserveSlot.fulfilled, (state, action) => {
        state.isReserving = false;
        const index = state.slots.findIndex((slot) => slot.id === action.payload.id);
        if (index !== -1) {
          state.slots[index].status = 'RESERVED';
          state.slots[index].reservedUntil = action.payload.reservedUntil;
        }
      })
      .addCase(reserveSlot.rejected, (state, action) => {
        state.isReserving = false;
        state.error = action.payload as string;
      })
      // Check expired reservations
      .addCase(checkExpiredReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkExpiredReservations.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh slots to get updated statuses
        // This could be optimized by updating specific slots, but for now we'll let the user refresh
      })
      .addCase(checkExpiredReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = slotSlice.actions;
export default slotSlice.reducer;
