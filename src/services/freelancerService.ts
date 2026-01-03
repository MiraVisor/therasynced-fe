import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import type { ProfileCompletionResponse } from '@/types/freelancer';
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
  date?: string; // NEW: ISO date format YYYY-MM-DD - filter by date
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
    meta: response.data.meta || {
      timestamp: new Date().toISOString(),
      path: ENDPOINTS.freelancer.search,
    },
  };
};

export const searchFreelancersAutocomplete = async (
  query: string,
  limit: number = 8,
): Promise<ApiResponse<Expert[]>> => {
  const response = await api.get(ENDPOINTS.freelancer.search, {
    params: {
      name: query,
      limit,
      page: 1,
    },
  });
  return {
    success: true,
    data: response.data.data || [],
    pagination: response.data.pagination,
    meta: response.data.meta || {
      timestamp: new Date().toISOString(),
      path: ENDPOINTS.freelancer.search,
    },
  };
};

export interface FreelancerDetailResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    city: string | null;
    description: string | null;
    gender: string;
    dob: string | null; // ISO date string
    homeAddress: string | null;
    clinicAddress: string | null;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    isActive: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
  jobTitle: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  serviceCategories: Array<{
    id: string;
    name: string;
    description: string | null;
    jobTitleId: string;
  }>;
  slotDurations: Array<{
    duration: number;
    price: number;
    currency: string;
  }>;
  serviceLocationPricing: Array<{
    serviceCategory: {
      id: string;
      name: string;
      description: string | null;
    };
    locationType: 'HOME' | 'CLINIC';
    price: number;
    currency: string;
  }>;
  stampInfo: {
    currentStampCount: number;
    stampTarget: number;
    stampsRemaining: number;
    rewardReady: boolean;
    rewardReserved: boolean;
    rewardReadySince: string | null; // ISO date string
    discountPercentage: number;
    customConfigApplied: boolean;
  } | null;
}

export const getFreelancerById = async (
  freelancerId: string,
): Promise<{ success: boolean; data: FreelancerDetailResponse }> => {
  const response = await api.get(`/freelancer/details/${freelancerId}`);
  return response.data;
};

/**
 * Get profile completion status for the current freelancer
 */
export const getProfileCompletion = async (): Promise<ProfileCompletionResponse> => {
  const response = await api.get(ENDPOINTS.freelancer.profileCompletion);
  return response.data;
};

const freelancerService = {
  getAllFreelancers,
  favoriteFreelancer,
  getRecentFavoriteFreelancer,
  getAllFavoriteFreelancers,
  getStats,
  searchFreelancers,
  searchFreelancersAutocomplete,
  getFreelancerById,
  getProfileCompletion,
};

export { freelancerService };
export default freelancerService;
