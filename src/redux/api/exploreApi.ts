import api from '@/services/api';

export const getRecentFavoriteFreelancer = async () => {
  const response = await api.get('/freelancer/favorite/recent');
  return response.data;
};

export const getAllFavoriteFreelancers = async () => {
  const response = await api.get('/freelancer/favorite/all');
  return response.data;
};

export const getPatientBookings = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get('/booking/patient/all', { params });
  return response.data;
};

export const rescheduleBooking = async (bookingId: string, newSlotId: string) => {
  const response = await api.patch('/booking/reschedule', {
    bookingId,
    newSlotId,
  });
  return response.data;
};
