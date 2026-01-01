import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as pricingApi from '@/services/pricingService';
import { getApiErrorMessage } from '@/types/common';
import type {
  FreelancerPricing,
  UpdateDurationPricingDto,
  UpdateLocationPricingDto,
  UpdateServicePricingDto,
} from '@/types/pricing';

/**
 * Hook to fetch freelancer pricing settings
 */
export const useFreelancerPricing = () => {
  return useQuery({
    queryKey: ['pricing', 'freelancer'],
    queryFn: () => pricingApi.getFreelancerPricing(),
    select: (data) => data.data,
  });
};

/**
 * Hook to update service pricing (legacy - single price per category)
 */
export const useUpdateServicePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pricing: UpdateServicePricingDto[]) =>
      pricingApi.updateServicePricing({ pricing }),
    onSuccess: (data) => {
      // Update the cache with new service pricing
      queryClient.setQueryData<{ data: FreelancerPricing }>(['pricing', 'freelancer'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            servicePricing: data.data.servicePricing,
          },
        };
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['pricing', 'freelancer'] });
      toast.success('Service pricing updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to update service pricing');
    },
  });
};

/**
 * Hook to update location-based service pricing
 */
export const useUpdateLocationPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pricing: UpdateLocationPricingDto[]) =>
      pricingApi.updateLocationPricing({ pricing }),
    onSuccess: (data) => {
      // Update the cache with new service pricing
      queryClient.setQueryData<{ data: FreelancerPricing }>(['pricing', 'freelancer'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            servicePricing: data.data.servicePricing,
          },
        };
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['pricing', 'freelancer'] });
      toast.success('Location-based pricing updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to update location-based pricing');
    },
  });
};

/**
 * Hook to update duration pricing
 */
export const useUpdateDurationPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pricing: UpdateDurationPricingDto[]) =>
      pricingApi.updateDurationPricing({ pricing }),
    onSuccess: (data) => {
      // Update the cache with new duration pricing
      queryClient.setQueryData<{ data: FreelancerPricing }>(['pricing', 'freelancer'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            durationPricing: data.data.durationPricing,
          },
        };
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['pricing', 'freelancer'] });
      toast.success('Duration pricing updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to update duration pricing');
    },
  });
};

/**
 * Hook to delete location-based pricing
 */
export const useDeleteLocationPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceCategoryId,
      locationType,
    }: {
      serviceCategoryId: string;
      locationType: 'HOME' | 'CLINIC';
    }) => pricingApi.deleteLocationPricing(serviceCategoryId, locationType),
    onSuccess: () => {
      // Invalidate to refetch updated pricing
      queryClient.invalidateQueries({ queryKey: ['pricing', 'freelancer'] });
      toast.success('Location pricing deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to delete location pricing');
    },
  });
};
