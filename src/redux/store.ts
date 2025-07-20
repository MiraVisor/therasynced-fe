import { configureStore } from '@reduxjs/toolkit';

import {
  appointmentSlice,
  authSlice,
  bookingSlice,
  calendarSlice,
  exploreSlice,
  overviewSlice,
  serviceSlice,
  slotReducer,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appoinment: appointmentSlice,
    calendar: calendarSlice,
    overview: overviewSlice,
    explore: exploreSlice,
    booking: bookingSlice,
    slot: slotReducer,
    service: serviceSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
