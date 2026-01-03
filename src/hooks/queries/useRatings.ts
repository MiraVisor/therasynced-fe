import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as ratingApi from '@/services/ratingService';
import { getApiErrorMessage } from '@/types/common';
import { ToggleRatingVisibilityRequest } from '@/types/rating';
import { CreateRatingDto } from '@/types/types';

/**
 * Hook to fetch freelancer ratings
 */
export const useFreelancerRatings = (
  freelancerId: string | null,
  params?: {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
  },
) => {
  return useQuery({
    queryKey: ['ratings', 'freelancer', freelancerId, params],
    queryFn: () => ratingApi.getFreelancerRatings(freelancerId!, params),
    enabled: !!freelancerId,
  });
};

/**
 * Hook to check rating eligibility for a booking
 */
export const useRatingEligibility = (bookingId: string | null) => {
  return useQuery({
    queryKey: ['ratings', 'eligibility', bookingId],
    queryFn: () => ratingApi.checkRatingEligibility(bookingId!),
    enabled: !!bookingId,
  });
};

/**
 * Hook to fetch my ratings
 */
export const useMyRatings = (params?: {
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}) => {
  return useQuery({
    queryKey: ['ratings', 'my', params],
    queryFn: () => ratingApi.getMyRatings(params),
  });
};

/**
 * Hook to create a rating
 */
export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingDto) => ratingApi.createRating(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ratings'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Rating submitted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to submit rating');
    },
  });
};

/**
 * Hook to toggle rating visibility
 */
export const useToggleRatingVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleRatingVisibilityRequest) => ratingApi.toggleRatingVisibility(data),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ['ratings'] });
      toast.success(response.message || 'Rating visibility updated successfully');
    },
    onError: (error: unknown) => {
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (apiError.response?.status === 403) {
          const errorMessage =
            apiError.response?.data?.message ||
            'Bronze tier cannot toggle rating visibility. Please upgrade to Silver or Gold.';
          toast.error(errorMessage);
          return;
        }
        if (apiError.response?.status === 404) {
          toast.error('Rating not found');
          return;
        }
      }
      toast.error(getApiErrorMessage(error) || 'Failed to toggle rating visibility');
    },
  });
};
