import api from '@/services/api';
import { ApiResponse, Freelancer } from '@/types/types';

export const getAllFreelancers = async (): Promise<ApiResponse<Freelancer[]>> => {
  const response = await api.get('/freelancers');
  return response.data;
};

export const favoriteFreelancer = async (
  freelancerId: string,
): Promise<ApiResponse<{ favorited: boolean }>> => {
  const response = await api.post(`/freelancers/${freelancerId}/favorite`);
  return response.data;
};

export const getFavoriteFreelancers = async (): Promise<ApiResponse<Freelancer[]>> => {
  const response = await api.get('/freelancers/favorites');
  return response.data;
};
