export { default as appointmentSlice } from './appointmentSlice';
export { default as authSlice } from './authSlice';
export { default as bookingSlice } from './bookingSlice';
export { default as calendarSlice } from './calendarSlice';
export { default as exploreSlice } from './exploreSlice';
export { default as jobTitlesSlice } from './jobTitlesSlice';
export { default as overviewSlice } from './overviewSlice';
export { default as serviceCategoriesSlice } from './serviceCategoriesSlice';
export { default as slotReducer } from './slotSlice';

// Named exports for async thunks and actions
export {
  cancelUserBooking,
  clearSelectedBooking,
  fetchBookingById,
  fetchUserBookings,
  setSelectedBooking,
} from './bookingSlice';

export {
  cancelAppointment,
  fetchFreelancerAppointments,
  fetchFreelancerAppointmentsByDate,
  updateAppointment,
  updateAppointmentNotes,
} from './appointmentSlice';

export {
  createServiceAsync,
  deleteServiceAsync,
  fetchServices,
  updateServiceAsync,
} from './serviceSlice';

export {
  createServiceCategory,
  deleteServiceCategory,
  fetchServiceCategories,
  fetchServiceCategoriesStats,
  updateServiceCategory,
} from './serviceCategoriesSlice';

export {
  bookAppointment,
  fetchFreelancerServices,
  fetchFreelancerSlots,
  fetchUserProfile,
} from './overviewSlice';

export { logout, setRole } from './authSlice';

export {
  createJobTitle,
  deleteJobTitle,
  fetchJobTitles,
  fetchJobTitlesStats,
  updateJobTitle,
} from './jobTitlesSlice';
