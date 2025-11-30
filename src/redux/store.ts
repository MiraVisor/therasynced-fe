import { configureStore } from '@reduxjs/toolkit';

import analyticsSlice from './slices/analyticsSlice';
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
import jobTitlesSlice from './slices/jobTitlesSlice';
import loyaltySlice from './slices/loyaltySlice';
import overviewSlice from './slices/overviewSlice';
import profileSlice from './slices/profileSlice';
import serviceCategoriesSlice from './slices/serviceCategoriesSlice';
import serviceSlice from './slices/serviceSlice';
import slotReducer from './slices/slotSlice';
import stampSlice from './slices/stampSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import verificationSlice from './slices/verificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    analytics: analyticsSlice,
    appointment: appointmentSlice,
    calendar: calendarSlice,
    chat: chatSlice,
    complaint: complaintSlice,
    explore: exploreSlice,
    freelancerDashboard: freelancerDashboardSlice,
    imageUpload: imageUploadSlice,
    jobTitles: jobTitlesSlice,
    loyalty: loyaltySlice,
    overview: overviewSlice,
    profile: profileSlice,
    booking: bookingSlice,
    slot: slotReducer,
    serviceCategories: serviceCategoriesSlice,
    service: serviceSlice,
    certificate: certificateSlice,
    verification: verificationSlice,
    subscription: subscriptionSlice,
    stamps: stampSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
