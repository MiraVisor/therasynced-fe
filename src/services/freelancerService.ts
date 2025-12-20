import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
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

export interface FreelancerStatsDto {
  totalFreelancers: {
    value: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
  activeFreelancers: {
    value: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
}

export const getStats = async (): Promise<FreelancerStatsDto> => {
  const response = await api.get('/freelancer/admin/stats');
  return response.data.data;
};

export interface SearchFreelancersParams {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'rating' | 'availability';
  sortOrder?: 'asc' | 'desc';
  specialty?: string[];
  serviceCategories?: string[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  sessionType?: ('HOME' | 'CLINIC')[];
  availableThisWeek?: boolean;
  verificationStatus?: string;
  minRating?: number;
  tier?: string[];
  query?: string;
}

export const searchFreelancers = async (
  params: SearchFreelancersParams,
): Promise<ApiResponse<Expert[]>> => {
  const response = await api.get(ENDPOINTS.freelancer.search, { params });
  return {
    success: true,
    data: response.data.data || [],
    pagination: response.data.pagination || {
      page: params.page || 1,
      limit: params.limit || 12,
      total: response.data.data?.length || 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
};

const freelancerService = {
  getAllFreelancers,
  favoriteFreelancer,
  getRecentFavoriteFreelancer,
  getAllFavoriteFreelancers,
  getStats,
  searchFreelancers,
};

export { freelancerService };
export default freelancerService;
