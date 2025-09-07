import api from '@/services/api';
import { ApiResponse, Freelancer, PaginationDto } from '@/types/types';

export const getAllFreelancers = async (
  params?: PaginationDto,
): Promise<ApiResponse<Freelancer[]>> => {
  const response = await api.get('/freelancer/all', { params });
  // The backend returns { data, pagination } directly
  // We need to wrap it in the expected format for the frontend
  return {
    success: true,
    data: response.data.data,
    pagination: response.data.pagination || response.data.meta?.pagination,
    meta: response.data.meta,
  };
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
