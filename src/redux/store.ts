import { configureStore } from '@reduxjs/toolkit';

import {
  appointmentSlice,
  authSlice,
  bookingSlice,
  calendarSlice,
  chatSlice,
  exploreSlice,
  overviewSlice,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appoinment: appointmentSlice,
    calendar: calendarSlice,
    overview: overviewSlice,
    explore: exploreSlice,
    booking: bookingSlice,
    chat: chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
