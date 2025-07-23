import api from '@/services/api';

export const getAllFreelancers = async () => {
  const response = await api.get('/freelancer/all');
  return response.data;
};

export const favoriteFreelancer = async (freelancerId: string) => {
  const response = await api.post('/freelancer/favorite', { freelancerId });
  return response.data;
};

export const getFreelancerSlots = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  freelancerId?: string;
}) => {
  // Send freelancerId as a top-level param, not inside params object
  const { freelancerId, ...rest } = params;
  const response = await api.post('/slot/list', { ...rest, freelancerId });
  return response.data;
};

export const reserveSlot = async (slotId: string) => {
  const response = await api.post('/slot/reserve', { slotId });
  return response.data;
};

export const createBooking = async (data: {
  slotId: string;
  serviceIds?: string[];
  clientId?: string;
  clientAddress?: string;
  notes?: string;
}) => {
  const response = await api.post('/booking/create', data);
  return response.data;
};

export const getFreelancerServices = async (freelancerId: string) => {
  const response = await api.get(`/freelancer/${freelancerId}/services`);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};
