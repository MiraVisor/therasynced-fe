import { configureStore } from '@reduxjs/toolkit';

import { appointmentSlice, authSlice, calendarSlice } from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appoinment: appointmentSlice,
    calendar: calendarSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
