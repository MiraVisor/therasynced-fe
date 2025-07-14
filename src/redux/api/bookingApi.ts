import api from '@/services/api';

// GET /v1/booking/patient/all
export const getPatientBookings = async (params?: { sort?: 'newest' | 'oldest' }) => {
  const query = params?.sort ? `?sortOrder=${params.sort}` : '';
  const response = await api.get(`/booking/patient/all${query}`);
  return response.data;
};

// POST /v1/rate
export const rateFreelancer = async ({
  freelancerId,
  rating,
  review,
  bookingId,
}: {
  freelancerId: string;
  rating: number;
  review: string;
  bookingId: string;
}) => {
  const response = await api.post('/freelancer/rate', { freelancerId, rating, review, bookingId });
  return response.data;
};
