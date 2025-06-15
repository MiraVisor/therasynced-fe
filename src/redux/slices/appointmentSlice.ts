import { createSlice } from '@reduxjs/toolkit';

import { Appointment } from '@/types/types';

interface AppointmentState {
  appointments: Appointment[];
}

const initialState: AppointmentState = {
  appointments: [],
};

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
    updateAppointmentStatus: (state, action) => {
      const { id, status } = action.payload;
      const appointment = state.appointments.find((apt) => apt.id === id);
      if (appointment) {
        appointment.status = status;
      }
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
