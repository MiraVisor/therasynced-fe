import api from '@/services/api';

export const getRecentFavoriteFreelancer = async () => {
  const response = await api.get('/freelancer/favorite/recent');
  return response.data;
};

export const getPatientBookings = async () => {
  const response = await api.get('/booking/patient/all');
  return response.data;
};

export const rescheduleBooking = async (bookingId: string, newSlotId: string) => {
  const response = await api.patch('/v1/booking/reschedule', {
    bookingId,
    newSlotId,
  });
  return response.data;
};
