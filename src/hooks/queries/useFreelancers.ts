import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  favoriteFreelancer,
  getAllFavoriteFreelancers,
  getAllFreelancers,
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
    select: (data) => data.data as Expert[],
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
    onSuccess: (result: any) => {
      // Invalidate freelancers query to refetch
      queryClient.invalidateQueries({ queryKey: ['freelancers'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });

      // Show toast notification
      if (result && typeof result === 'object' && 'favorited' in result) {
        toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
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
