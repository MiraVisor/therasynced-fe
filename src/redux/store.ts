import { configureStore } from '@reduxjs/toolkit';

import appointmentSlice from './slices/appointmentSlice';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import calendarSlice from './slices/calendarSlice';
import exploreSlice from './slices/exploreSlice';
import freelancerSlice from './slices/freelancerSlice';
import overviewSlice from './slices/overviewSlice';

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
