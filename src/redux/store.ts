import { configureStore } from '@reduxjs/toolkit';

import { appointmentSlice, authSlice, calendarSlice, exploreSlice, overviewSlice } from './slices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appoinment: appointmentSlice,
    calendar: calendarSlice,
    overview: overviewSlice,
    explore: exploreSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
