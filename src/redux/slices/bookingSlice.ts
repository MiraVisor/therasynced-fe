import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getPatientBookings, rateFreelancer } from '../api/bookingApi';

export const fetchPatientBookings = createAsyncThunk(
  'booking/fetchPatientBookings',
  async (params: { sort?: 'newest' | 'oldest' } = {}, { rejectWithValue }) => {
    try {
      const response = await getPatientBookings(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch bookings');
    }
  },
);

export const submitFreelancerRating = createAsyncThunk(
  'booking/submitFreelancerRating',
  async (
    {
      freelancerId,
      rating,
      review,
      bookingId,
    }: { freelancerId: string; rating: number; review: string; bookingId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await rateFreelancer({ freelancerId, rating, review, bookingId });
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to submit rating');
    }
  },
);

const initialState = {
  bookings: [],
  loading: false,
  error: null as string | null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload ?? [];
      })
      .addCase(fetchPatientBookings.rejected, (state, action) => {
        state.loading = false;
        state.bookings = [];
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error?.message ?? 'Unknown error');
      });
  },
});

export default bookingSlice.reducer;
