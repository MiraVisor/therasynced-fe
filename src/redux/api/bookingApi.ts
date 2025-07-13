import api from '@/services/api';

export const getPatientBookings = async (date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get('/v1/booking/patient/all', { params });
  return response.data;
};
