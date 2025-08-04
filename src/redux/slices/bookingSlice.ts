import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Booking, CancelBookingDto, CreateBookingDto } from '@/types/types';

import {
  cancelBooking as cancelBookingApi,
  createBooking as createBookingApi,
  getPatientBookings,
} from '../api/bookingApi';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  meta?: any;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
  meta: undefined,
};

export const fetchBookings = createAsyncThunk(
  'booking/fetchAll',
  async (params: { includePast?: boolean; pagination?: any }, { rejectWithValue }) => {
    try {
      const res = await getPatientBookings(params);
      if (res.success && Array.isArray(res.data)) {
        return {
          bookings: res.data,
          meta: res.meta,
        };
      } else {
        return rejectWithValue('Failed to load bookings');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load bookings');
    }
  },
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (data: CreateBookingDto, { rejectWithValue }) => {
    try {
      const res = await createBookingApi(data);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to create booking');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to create booking');
    }
  },
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (data: CancelBookingDto, { rejectWithValue }) => {
    try {
      const res = await cancelBookingApi(data);
      if (res.success) {
        return { bookingId: data.bookingId };
      } else {
        return rejectWithValue(res.message || 'Failed to cancel booking');
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
    clearError: (state) => {
      state.error = null;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.meta = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Add new booking to the list
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        // Update booking status to cancelled
        state.bookings = state.bookings.map((booking) =>
          booking.id === action.payload.bookingId ? { ...booking, status: 'CANCELLED' } : booking,
        );
      });
  },
});

export const { clearError, clearBookings } = bookingSlice.actions;

export default bookingSlice.reducer;
