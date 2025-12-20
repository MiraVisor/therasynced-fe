import { useQuery } from '@tanstack/react-query';

import { jobTitleService } from '@/services/jobTitleService';
import { JobTitle } from '@/types/types';

/**
 * Hook to fetch active job titles
 */
export const useJobTitles = () => {
  return useQuery({
    queryKey: ['jobTitles', 'active'],
    queryFn: () => jobTitleService.getActiveJobTitles(),
    select: (data) => data.data as JobTitle[],
    staleTime: 10 * 60 * 1000, // 10 minutes - job titles don't change often
  });
};
