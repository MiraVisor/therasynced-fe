import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as availabilityApi from '@/services/availabilityService';
import type { BlockDatesDto, UnblockDatesDto } from '@/types/availability';
import { getApiErrorMessage } from '@/types/common';

/**
 * Hook to fetch blocked dates
 */
export const useBlockedDates = () => {
  return useQuery({
    queryKey: ['availability', 'blocked-dates'],
    queryFn: () => availabilityApi.getBlockedDates(),
    select: (data) => data.data.blockedDates,
  });
};

/**
 * Hook to block dates
 */
export const useBlockDates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockDatesDto) => availabilityApi.blockDates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'blocked-dates'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] }); // Refresh slots to reflect blocking
      toast.success('Dates blocked successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to block dates');
    },
  });
};

/**
 * Hook to unblock dates
 */
export const useUnblockDates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UnblockDatesDto) => availabilityApi.unblockDates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'blocked-dates'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] }); // Refresh slots to reflect unblocking
      toast.success('Dates unblocked successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to unblock dates');
    },
  });
};
