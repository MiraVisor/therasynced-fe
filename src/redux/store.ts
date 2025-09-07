import { configureStore } from '@reduxjs/toolkit';

import appointmentSlice from './slices/appointmentSlice';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import calendarSlice from './slices/calendarSlice';
import exploreSlice from './slices/exploreSlice';
import overviewSlice from './slices/overviewSlice';
import serviceSlice from './slices/serviceSlice';
import slotReducer from './slices/slotSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointment: appointmentSlice,
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
