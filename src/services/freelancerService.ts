import { TierFreelancerResponse } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

// Types
export interface FreelancerStatsDto {
  totalFreelancers: {
    value: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
  activeFreelancers: {
    value: number;
  };
}

export interface FreelancerAnalyticsResponse {
  completedSessions: number;
  sessionsChange: number;
  totalHours: number;
  completionRate: number;
  averageRating: number | null;
  ratedSessions: number;
  activeClients: number;
  newClients: number;
  returningClients: number;
  topClients: Array<{
    id: string;
    name: string;
    sessions: number;
    totalHours: number;
    averageRating?: number;
  }>;
  serviceAnalytics: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
    averagePrice: number;
    percentage: number;
  }>;
  serviceCategoryAnalytics: Array<{
    categoryName: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }>;
  revenueAnalytics: {
    totalRevenue: number;
    revenueChange: number;
    averageSessionPrice: number;
    timeSeries?: Array<{
      date: string;
      revenue: number;
      sessions: number;
    }>;
  };
}

// API Functions
export const freelancerService = {
  // Get all freelancers (future slots only)
  getAllFreelancers: async (params?: { limit?: number; page?: number; name?: string }) => {
    const response = await api.get(ENDPOINTS.freelancer.all, { params });
    return response.data;
  },

  // Get freelancer stats
  getStats: async (): Promise<FreelancerStatsDto> => {
    const response = await api.get(ENDPOINTS.freelancer.stats);
    return response.data.data;
  },

  // Favorite/unfavorite a freelancer
  toggleFavorite: async (freelancerId: string) => {
    const response = await api.post(ENDPOINTS.freelancer.favorite, { freelancerId });
    return response.data;
  },

  // Get all favorite freelancers
  getFavoriteFreelancers: async () => {
    const response = await api.get(ENDPOINTS.freelancer.favoriteAll);
    return response.data;
  },

  // Get most recent favorite freelancer
  getRecentFavoriteFreelancer: async () => {
    const response = await api.get(ENDPOINTS.freelancer.recentFavorite);
    return response.data;
  },

  // Get freelancer analytics
  getAnalytics: async (): Promise<FreelancerAnalyticsResponse> => {
    const response = await api.get(ENDPOINTS.freelancer.analytics);
    return response.data.data;
  },

  // Get Bronze tier freelancers
  getBronzeFreelancers: async (params?: {
    limit?: number;
    page?: number;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TierFreelancerResponse> => {
    const response = await api.get(ENDPOINTS.freelancer.tierBronze, { params });
    return response.data;
  },

  // Get Silver tier freelancers
  getSilverFreelancers: async (params?: {
    limit?: number;
    page?: number;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TierFreelancerResponse> => {
    const response = await api.get(ENDPOINTS.freelancer.tierSilver, { params });
    return response.data;
  },

  // Get Gold tier freelancers
  getGoldFreelancers: async (params?: {
    limit?: number;
    page?: number;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TierFreelancerResponse> => {
    const response = await api.get(ENDPOINTS.freelancer.tierGold, { params });
    return response.data;
  },

  // Search freelancers for autocomplete (uses existing endpoint with limit)
  searchFreelancersAutocomplete: async (query: string, limit: number = 8) => {
    const response = await api.get(ENDPOINTS.freelancer.all, {
      params: { name: query, limit, page: 1 },
    });
    return response.data;
  },

  // Unified search freelancers with filters
  searchFreelancers: async (params?: {
    query?: string;
    specialty?: string[];
    serviceCategories?: string[];
    location?: string;
    priceMin?: number;
    priceMax?: number;
    sessionType?: ('HOME' | 'CLINIC')[];
    availableThisWeek?: boolean;
    verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    minRating?: number;
    tier?: string[];
    sortBy?: 'relevance' | 'rating' | 'price' | 'availability' | 'newest';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<TierFreelancerResponse> => {
    // Build query string manually to handle arrays without brackets
    // Backend expects: specialty=uuid1&specialty=uuid2 (not specialty[]=uuid1)
    const searchParams = new URLSearchParams();

    // Add non-array params
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.query) searchParams.append('query', params.query);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.priceMin !== undefined) searchParams.append('priceMin', params.priceMin.toString());
    if (params?.priceMax !== undefined) searchParams.append('priceMax', params.priceMax.toString());
    if (params?.availableThisWeek) searchParams.append('availableThisWeek', 'true');
    if (params?.minRating !== undefined)
      searchParams.append('minRating', params.minRating.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    // Add array params - each value as separate param (no brackets)
    if (params?.specialty && params.specialty.length > 0) {
      params.specialty.forEach((id) => {
        searchParams.append('specialty', id);
      });
    }
    if (params?.serviceCategories && params.serviceCategories.length > 0) {
      params.serviceCategories.forEach((id) => {
        searchParams.append('serviceCategories', id);
      });
    }
    if (params?.sessionType && params.sessionType.length > 0) {
      params.sessionType.forEach((type) => {
        searchParams.append('sessionType', type);
      });
    }
    if (params?.tier && params.tier.length > 0) {
      params.tier.forEach((tier) => {
        searchParams.append('tier', tier);
      });
    }

    // verificationStatus should be single value, not array
    if (params?.verificationStatus) {
      const status = Array.isArray(params.verificationStatus)
        ? params.verificationStatus[0]
        : params.verificationStatus;
      if (status) {
        searchParams.append('verificationStatus', status);
      }
    }

    const response = await api.get(`${ENDPOINTS.freelancer.search}?${searchParams.toString()}`);
    return response.data;
  },
};

export default freelancerService;
