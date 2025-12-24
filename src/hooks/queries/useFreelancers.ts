import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  favoriteFreelancer,
  getAllFavoriteFreelancers,
  getAllFreelancers,
  getStats,
  searchFreelancers,
  SearchFreelancersParams,
} from '@/services/freelancerService';
import { Expert } from '@/types/types';

interface FreelancerParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
}

/**
 * Hook to fetch all freelancers
 */
export const useFreelancers = (params?: FreelancerParams) => {
  return useQuery({
    queryKey: ['freelancers', params],
    queryFn: () => getAllFreelancers(params),
    select: (data) => ({
      freelancers: data.data,
      pagination: data.pagination,
    }),
  });
};

/**
 * Hook to fetch favorite freelancers
 */
export const useFavoriteFreelancers = (params?: { name?: string }) => {
  return useQuery({
    queryKey: ['favorites', params],
    queryFn: () => getAllFavoriteFreelancers(params),
    select: (data) => data.data as Expert[],
  });
};

/**
 * Hook to favorite/unfavorite a freelancer
 */
export const useFavoriteFreelancer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (freelancerId: string) => favoriteFreelancer(freelancerId),
    onSuccess: (result: unknown) => {
      // Invalidate freelancers query to refetch
      void queryClient.invalidateQueries({ queryKey: ['freelancers'] });
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });

      // Show toast notification
      if (result && typeof result === 'object' && 'favorited' in result) {
        const { favorited } = result as { favorited: boolean };
        toast.success(favorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.success('Favorite updated');
      }
    },
    onError: () => {
      toast.error('Failed to update favorite');
    },
  });
};

/**
 * Hook to fetch freelancer dashboard data
 */
export const useFreelancerDashboard = () => {
  return useQuery({
    queryKey: ['freelancerDashboard'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.dashboard.freelancerOverview);
      return response.data.data;
    },
    select: (data) => data,
  });
};

/**
 * Hook to fetch freelancer stats
 */
export const useFreelancerStats = () => {
  return useQuery({
    queryKey: ['freelancerStats'],
    queryFn: () => getStats(),
  });
};

/**
 * Hook to search freelancers with filters (single page)
 */
export const useSearchFreelancers = (params: SearchFreelancersParams) => {
  return useQuery({
    queryKey: ['searchFreelancers', params],
    queryFn: () => searchFreelancers(params),
    select: (data) => ({
      freelancers: data.data,
      pagination: data.pagination,
    }),
  });
};

/**
 * Hook to search freelancers with infinite scroll/load more
 */
export const useInfiniteSearchFreelancers = (baseParams: Omit<SearchFreelancersParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['searchFreelancers', 'infinite', baseParams],
    queryFn: ({ pageParam = 1 }) =>
      searchFreelancers({
        ...baseParams,
        page: pageParam,
        limit: baseParams.limit || 12,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const { pagination } = lastPage;
      if (pagination?.hasNext) {
        return (pagination.page || allPages.length) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    select: (data) => ({
      pages: data.pages.map((page) => ({
        freelancers: page.data,
        pagination: page.pagination,
      })),
      pageParams: data.pageParams,
    }),
  });
};
