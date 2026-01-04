import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';

import { searchFreelancers, SearchFreelancersParams } from '@/services/freelancerService';

interface UseBookingSearchParams {
  query?: string;
  serviceCategories?: string[];
  locationPreference?: 'HOME' | 'CLINIC' | 'BOTH';
  preferredDate?: Date | null;
  enabled?: boolean;
}

export const useBookingSearch = ({
  query,
  serviceCategories,
  locationPreference,
  preferredDate,
  enabled = true,
}: UseBookingSearchParams) => {
  const searchParams: SearchFreelancersParams = useMemo(() => {
    const params: SearchFreelancersParams = {
      limit: 50,
      sortBy: 'relevance',
      sortOrder: 'desc',
    };

    if (query) {
      params.query = query;
    }

    if (serviceCategories && serviceCategories.length > 0) {
      params.serviceCategories = serviceCategories;
    }

    if (locationPreference && locationPreference !== 'BOTH') {
      params.sessionType = [locationPreference];
    }

    // NEW: Add date parameter if provided (ISO format YYYY-MM-DD)
    if (preferredDate) {
      params.date = format(preferredDate, 'yyyy-MM-dd');
    }

    return params;
  }, [query, serviceCategories, locationPreference, preferredDate]);

  return useQuery({
    queryKey: ['bookingSearch', searchParams],
    queryFn: () => searchFreelancers(searchParams),
    enabled:
      enabled &&
      (!!query || !!preferredDate || (serviceCategories && serviceCategories.length > 0)),
    select: (data) => ({
      freelancers: data.data || [],
      pagination: data.pagination,
    }),
  });
};
