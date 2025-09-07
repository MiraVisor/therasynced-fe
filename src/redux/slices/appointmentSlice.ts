import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Appointment } from '@/types/types';

import * as bookingApi from '../api/bookingApi';

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  isLoading: false,
  error: null,
};

// Fetch freelancer bookings/appointments
export const fetchFreelancerAppointments = createAsyncThunk(
  'appointment/fetchFreelancerAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getFreelancerBookings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },
);

export const fetchFreelancerAppointmentsByDate = createAsyncThunk(
  'appointment/fetchFreelancerAppointmentsByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getFreelancerAppointmentsByDate(date);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },
);

export const updateAppointmentNotes = createAsyncThunk(
  'appointment/updateNotes',
  async (
    { appointmentId, notes }: { appointmentId: string; notes: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingApi.updateBookingNotes(appointmentId, notes);
      return { appointmentId, notes, data: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  },
);

// Update appointment status
// export const updateAppointmentStatus = createAsyncThunk(
//   'appointment/updateStatus',
//   async ({ bookingId, status }: { bookingId: string; status: string }, { rejectWithValue }) => {
//     try {
//       const response = await bookingApi.updateBookingStatus(bookingId, status);
//       return { bookingId, status, data: response };
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update status');
//     }
//   },
// );

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async ({ bookingId, reason }: { bookingId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.cancelBooking({ bookingId, reason });
      return { bookingId, reason, data: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },
);

export const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex((apt) => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action) => {
      state.appointments = state.appointments.filter((apt) => apt.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchFreelancerAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFreelancerAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        // The backend returns { success, message, data, pagination, meta }
        // We need to map the booking data to appointment format
        const bookings = action.payload.data || [];
        const appointments = bookings.map((booking: any) => ({
          id: booking.id,
          title:
            booking.services?.length > 0
              ? booking.services.map((s: any) => s.name).join(', ')
              : 'General Session',
          start: booking.slot.startTime,
          end: booking.slot.endTime,
          status: booking.status,
          clientName: booking.client.name,
          description: booking.notes || '',
          location: booking.slot.location?.name || booking.slot.locationType,
          notes: booking.notes || '',
        }));
        state.appointments = appointments;
      })
      .addCase(fetchFreelancerAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update status
      // .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
      //   const appointment = state.appointments.find((apt) => apt.id === action.payload.bookingId);
      //   if (appointment) {
      //     appointment.status = action.payload.status as any;
      //   }
      // })
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const appointment = state.appointments.find((apt) => apt.id === action.payload.bookingId);
        if (appointment) {
          appointment.status = 'CANCELLED';
        }
      })
      // Update appointment notes
      .addCase(updateAppointmentNotes.fulfilled, (state, action) => {
        const appointment = state.appointments.find(
          (apt) => apt.id === action.payload.appointmentId,
        );
        if (appointment) {
          appointment.notes = action.payload.notes;
        }
      })
      .addCase(fetchFreelancerAppointmentsByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        const bookings = action.payload.data || [];
        const appointments = bookings.map((booking: any) => ({
          id: booking.id,
          title: booking.services.map((s: any) => s.name).join(', '),
          start: booking.slot.startTime,
          end: booking.slot.endTime,
          status: booking.status,
          clientName: booking.client.name,
          description: booking.notes || '',
          location: booking.slot.location?.name || booking.slot.locationType,
          notes: booking.notes || '',
        }));
        state.appointments = appointments;
      })
      .addCase(fetchFreelancerAppointmentsByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFreelancerAppointmentsByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
  },
});

export const { setAppointments, addAppointment, updateAppointment, deleteAppointment, clearError } =
  appointmentSlice.actions;

export default appointmentSlice.reducer;
