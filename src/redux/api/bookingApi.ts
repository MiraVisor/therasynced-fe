import api from '@/services/api';

//TODO: add these to endpoint file
export const getPatientBookings = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get('/booking/patient/all', { params });
  return response.data;
};

export const getBookingById = async (bookingId: string) => {
  const response = await api.get(`/booking/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId: string, reason?: string) => {
  const response = await api.delete(`/booking/${bookingId}/cancel`, { params: { reason } });
  return response.data;
};

// Freelancer booking history
export const getFreelancerBookings = async () => {
  const response = await api.get('/booking/freelancer/all');
  return response.data;
};

// Update booking status - This endpoint doesn't exist yet, but keeping for future implementation
// TODO: Uncomment when backend endpoint is implemented
// export const updateBookingStatus = async (bookingId: string, status: string) => {
//   const response = await api.patch(`/booking/${bookingId}/status`, { status });
//   return response.data;
// };

// Temporary implementation that returns success for now
export const updateBookingStatus = async (_bookingId: string, _status: string) => {
  // TODO: Replace with actual API call when backend endpoint is ready
  return { success: true, message: 'Status updated successfully' };
};

// Update booking notes
export const updateBookingNotes = async (bookingId: string, notes: string) => {
  const response = await api.patch(`/booking/${bookingId}/notes`, { notes });
  return response.data;
};

// Reschedule booking
export const rescheduleBooking = async (bookingId: string, newSlotId: string) => {
  const response = await api.post('/booking/reschedule', { bookingId, newSlotId });
  return response.data;
};

export const getFreelancerAppointmentsByDate = async (date: string) => {
  const response = await api.get('/booking/freelancer/appointments-by-date', {
    params: { date },
  });
  return response.data;
};
