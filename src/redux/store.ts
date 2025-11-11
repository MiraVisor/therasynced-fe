import { configureStore } from '@reduxjs/toolkit';

import appointmentSlice from './slices/appointmentSlice';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import calendarSlice from './slices/calendarSlice';
import certificateSlice from './slices/certificateSlice';
import chatSlice from './slices/chatSlice';
import complaintSlice from './slices/complaintSlice';
import exploreSlice from './slices/exploreSlice';
import freelancerDashboardSlice from './slices/freelancerDashboardSlice';
import imageUploadSlice from './slices/imageUploadSlice';
import loyaltySlice from './slices/loyaltySlice';
import overviewSlice from './slices/overviewSlice';
import serviceSlice from './slices/serviceSlice';
import slotReducer from './slices/slotSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import verificationSlice from './slices/verificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointment: appointmentSlice,
    calendar: calendarSlice,
    chat: chatSlice,
    complaint: complaintSlice,
    explore: exploreSlice,
    freelancerDashboard: freelancerDashboardSlice,
    imageUpload: imageUploadSlice,
    loyalty: loyaltySlice,
    overview: overviewSlice,
    booking: bookingSlice,
    slot: slotReducer,
    service: serviceSlice,
    certificate: certificateSlice,
    verification: verificationSlice,
    subscription: subscriptionSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
