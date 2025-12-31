import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { JobTitleEnum, ServiceCategory } from '@/types/types';

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
 * Hook to fetch service categories by job title
 */
export const useServiceCategoriesByJobTitle = (jobTitle: JobTitleEnum | null) => {
  return useQuery({
    queryKey: ['serviceCategories', 'byJobTitle', jobTitle],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.serviceCategories.getByJobTitle(jobTitle!));
      return response.data.data as ServiceCategory[];
    },
    enabled: !!jobTitle,
    staleTime: 10 * 60 * 1000,
  });
};
