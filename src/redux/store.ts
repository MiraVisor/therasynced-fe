import { configureStore } from '@reduxjs/toolkit';

import { appointmentSlice, authSlice, calendarSlice, exploreSlice, overviewSlice } from './slices';
import bookingSlice from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appoinment: appointmentSlice,
    calendar: calendarSlice,
    overview: overviewSlice,
    explore: exploreSlice,
    booking: bookingSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
