export { default as appointmentSlice } from './appointmentSlice';
export { default as authSlice } from './authSlice';
export { default as bookingSlice } from './bookingSlice';
export { default as calendarSlice } from './calendarSlice';
export { default as exploreSlice } from './exploreSlice';
export { default as overviewSlice } from './overviewSlice';
export { default as serviceSlice } from './serviceSlice';
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
  updateAppointmentNotes,
  updateAppointmentStatus,
} from './appointmentSlice';

export {
  createServiceAsync,
  deleteServiceAsync,
  fetchServices,
  updateServiceAsync,
} from './serviceSlice';

export { createSlot, deleteSlot, fetchSlots, updateSlot } from './slotSlice';

export {
  bookAppointment,
  fetchFreelancerServices,
  fetchFreelancerSlots,
  fetchUserProfile,
} from './overviewSlice';
