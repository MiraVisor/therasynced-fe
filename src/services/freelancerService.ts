import api from '@/services/api';
import { ApiResponse, Expert } from '@/types/types';

export const getAllFreelancers = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
}): Promise<ApiResponse<Expert[]>> => {
  const response = await api.get('/freelancer/all', { params });

  const result = {
    success: true,
    data: response.data.data,
    pagination: response.data.pagination ||
      response.data.meta?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 2,
        total: response.data.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    meta: response.data.meta,
  };
  return result;
};

export const favoriteFreelancer = async (freelancerId: string) => {
  const response = await api.post('/freelancer/favorite', { freelancerId });
  return response.data;
};

export const getRecentFavoriteFreelancer = async () => {
  const response = await api.get('/freelancer/favorite/recent');
  return response.data;
};

export const getAllFavoriteFreelancers = async (params?: { name?: string }) => {
  const response = await api.get('/freelancer/favorite/all', { params });
  return response.data;
};
