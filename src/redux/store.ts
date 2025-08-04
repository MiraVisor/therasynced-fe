import { configureStore } from '@reduxjs/toolkit';

import {
  appointmentSlice,
  authSlice,
  bookingSlice,
  calendarSlice,
  exploreSlice,
  freelancerSlice,
  overviewSlice,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointment: appointmentSlice,
    booking: bookingSlice,
    calendar: calendarSlice,
    overview: overviewSlice,
    explore: exploreSlice,
    freelancer: freelancerSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
