import { useQuery } from '@tanstack/react-query';

import * as exploreApi from '@/services/exploreService';
import { Booking, Expert } from '@/types/types';

/**
 * Hook to fetch recent favorite freelancer
 */
export const useRecentFavoriteFreelancer = () => {
  return useQuery({
    queryKey: ['explore', 'recent-favorite'],
    queryFn: () => exploreApi.getRecentFavoriteFreelancer(),
    select: (data) => data.data as Expert | null,
  });
};

/**
 * Hook to fetch all favorite freelancers
 */
export const useFavoriteFreelancers = (params?: { name?: string }) => {
  return useQuery({
    queryKey: ['favorites', params],
    queryFn: () => exploreApi.getAllFavoriteFreelancers(params),
    select: (data) => data.data as Expert[],
  });
};

/**
 * Hook to fetch patient bookings for explore page
 */
export const useExplorePatientBookings = (date?: string) => {
  return useQuery({
    queryKey: ['explore', 'bookings', date],
    queryFn: () => exploreApi.getPatientBookings(date),
    select: (data) => data.data as Booking[],
  });
};
