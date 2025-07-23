import api from '@/services/api';

export const getPatientBookings = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get('/booking/patient/all', { params });
  return response.data;
};

export const getBookingById = async (bookingId: string) => {
  const response = await api.get(`/booking/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId: string) => {
  const response = await api.delete(`/booking/${bookingId}/cancel`);
  return response.data;
};
