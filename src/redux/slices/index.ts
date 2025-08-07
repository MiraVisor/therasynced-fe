// Export actions and thunks from each slice
export * from './appointmentSlice';
export { default as appointmentSlice } from './appointmentSlice';

export * from './authSlice';
export { default as authSlice } from './authSlice';

// Export booking slice
export { default as bookingSlice } from './bookingSlice';

export * from './calendarSlice';
export { default as calendarSlice } from './calendarSlice';

export * from './exploreSlice';
export { default as exploreSlice } from './exploreSlice';

// Export freelancer slice
export { default as freelancerSlice } from './freelancerSlice';

// Export overview slice
export {
  clearReservedSlots,
  confirmSlotReservation,
  default as overviewSlice,
  releaseSlotReservation,
  removeSlotFromAvailable,
  reserveSlot,
  setSocketConnected,
  updateMultipleSlots,
  updateSlotStatus,
} from './overviewSlice';
