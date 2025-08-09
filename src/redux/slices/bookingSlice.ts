import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  cancelBooking as cancelBookingApi,
  getBookingById,
  getPatientBookings,
} from '../api/bookingApi';

interface BookingState {
  bookings: any[];
  currentBooking: any | null;
  selectedBooking: any | null;
  loading: boolean;
  error: string | null;
  pagination?: any;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  selectedBooking: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async ({ date }: { date?: string }, { rejectWithValue }) => {
    try {
      const res = await getPatientBookings(date);
      if (res.success && Array.isArray(res.data)) {
        return {
          bookings: res.data,
          pagination: res.pagination,
        };
      } else {
        return rejectWithValue('Failed to load bookings');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load bookings');
    }
  },
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const res = await getBookingById(bookingId);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue('Failed to load booking details');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load booking details');
    }
  },
);

export const cancelUserBooking = createAsyncThunk(
  'booking/cancelUserBooking',
  async ({ bookingId, reason }: { bookingId: string; reason: string }, { rejectWithValue }) => {
    try {
      const res = await cancelBookingApi({ bookingId, reason });
      if (res.success) {
        return { bookingId };
      } else {
        return rejectWithValue('Failed to cancel booking');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to cancel booking');
    }
  },
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.bookings = [];
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelUserBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelUserBooking.fulfilled, (state, action) => {
        state.loading = false;
        const bookingIndex = state.bookings.findIndex(
          (booking) => booking.id === action.payload.bookingId,
        );
        if (bookingIndex !== -1) {
          state.bookings[bookingIndex].status = 'CANCELLED';
        }
      })
      .addCase(cancelUserBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookings, clearCurrentBooking, setSelectedBooking, clearSelectedBooking } =
  bookingSlice.actions;

export default bookingSlice.reducer;
