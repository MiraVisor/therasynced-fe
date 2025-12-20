import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as ratingApi from '@/services/ratingService';
import { CreateRatingDto, FreelancerRatingsResponse, RatingEligibility } from '@/types/types';

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
    select: (data) => data.data as FreelancerRatingsResponse,
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
    select: (data) => data.data as RatingEligibility,
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
    select: (data) => data.data as FreelancerRatingsResponse,
  });
};

/**
 * Hook to create a rating
 */
export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingDto) => ratingApi.createRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Rating submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit rating');
    },
  });
};
