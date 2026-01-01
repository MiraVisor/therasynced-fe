import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { ServiceCategory } from '@/types';

/**
 * Hook to fetch all service categories
 */
export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['serviceCategories', 'all'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.serviceCategories.getAll);
      return response.data.data as ServiceCategory[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch service categories by freelancer ID.
 * This gets categories for a specific freelancer based on their job title.
 */
export const useServiceCategoriesByJobTitle = (freelancerId: string | null | undefined) => {
  return useQuery({
    queryKey: ['serviceCategories', 'byFreelancerId', freelancerId],
    queryFn: async () => {
      if (!freelancerId) {
        return [];
      }
      const response = await api.get(
        ENDPOINTS.serviceCategories.getCategoryByFreelancerId(freelancerId),
      );
      // Response shape: { success: true, data: [ { ...ServiceCategory } ] }
      return (response.data?.data ?? []) as ServiceCategory[];
    },
    enabled: !!freelancerId,
    staleTime: 10 * 60 * 1000,
  });
};
