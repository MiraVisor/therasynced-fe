import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as bookingApi from '@/services/bookingService';
import {
  Booking,
  CancelBookingDto,
  CompleteBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from '@/types/types';

/**
 * Invalidate every cache entry that depends on booking state.
 *
 * Called by every booking mutation (create / cancel / reschedule / complete)
 * so that counters, revenue, appointment graphs, and admin views refresh
 * in lock-step with the action the user just took. Previously each mutation
 * only invalidated a subset of these keys, which left stats stale until a
 * hard refresh. Keep this list aligned with the query keys declared in
 * useAdmin.ts, useFreelancers.ts, useAdminTransactions.ts and useSlots.ts.
 */
export const invalidateBookingStatsQueries = (queryClient: QueryClient) => {
  // Booking and slot queries (prefix-matched, covers patient + freelancer).
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
  queryClient.invalidateQueries({ queryKey: ['slots'] });

  // Freelancer dashboard / stats / analytics.
  queryClient.invalidateQueries({ queryKey: ['freelancerDashboard'] });
  queryClient.invalidateQueries({ queryKey: ['freelancerStats'] });
  queryClient.invalidateQueries({ queryKey: ['freelancerAnalytics'] });

  // Admin dashboard surfaces.
  queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
  queryClient.invalidateQueries({ queryKey: ['adminFinance'] });
  queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
  queryClient.invalidateQueries({ queryKey: ['adminTransactionStats'] });
};

/**
 * Hook to fetch patient bookings
 */
export const usePatientBookings = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  date?: string;
}) => {
  return useQuery({
    queryKey: ['bookings', 'patient', params],
    queryFn: () => bookingApi.getPatientBookings(params),
    select: (data) => data.data as Booking[],
  });
};

/**
 * Hook to fetch patient booking history
 */
export const usePatientBookingHistory = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['bookings', 'patient', 'history', params],
    queryFn: () => bookingApi.getPatientBookingHistory(params),
    select: (data) => data.data as Booking[],
  });
};

/**
 * Hook to fetch a single booking by ID
 */
export const useBooking = (bookingId: string | null) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId!),
    enabled: !!bookingId,
    select: (data) => data.data as Booking,
  });
};

/**
 * Hook to fetch patient booking stats
 */
export const usePatientBookingStats = () => {
  return useQuery({
    queryKey: ['bookings', 'patient', 'stats'],
    queryFn: () => bookingApi.getPatientBookingStats(),
    select: (data) => data.data,
  });
};

/**
 * Hook to create a booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingApi.createBooking(data),
    onSuccess: () => {
      invalidateBookingStatsQueries(queryClient);
    },
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelBookingDto) => bookingApi.cancelBooking(data),
    onSuccess: () => {
      invalidateBookingStatsQueries(queryClient);
    },
  });
};

/**
 * Hook to reschedule a booking
 */
export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RescheduleBookingDto) => bookingApi.rescheduleBooking(data),
    onSuccess: () => {
      invalidateBookingStatsQueries(queryClient);
    },
  });
};

/**
 * Hook to mark a booking as completed.
 *
 * IMPORTANT: marking a booking complete is the single event that should
 * flip revenue, appointment counts, and analytics forward across both the
 * freelancer and admin surfaces. It must therefore invalidate the full
 * booking-stats query set - not just ['bookings'] and ['slots']. Prior
 * direct call sites in SlotDetailsDialog and TabbedSlotsView were missing
 * admin/analytics invalidations, so counters stayed stale until reload.
 */
export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteBookingDto) => bookingApi.completeBooking(data),
    onSuccess: () => {
      invalidateBookingStatsQueries(queryClient);
    },
  });
};

/**
 * Hook to fetch freelancer bookings
 */
export const useFreelancerBookings = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['bookings', 'freelancer', params],
    queryFn: () => bookingApi.getFreelancerBookings(params),
    select: (data) => data.data as Booking[],
  });
};

/**
 * Hook to fetch freelancer future bookings
 */
export const useFreelancerFutureBookings = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['bookings', 'freelancer', 'future', params],
    queryFn: () => bookingApi.getFreelancerFutureBookings(params),
    select: (data) => data.data as Booking[],
  });
};

/**
 * Hook to fetch freelancer appointments by date
 */
export const useFreelancerAppointmentsByDate = (date: string | null) => {
  return useQuery({
    queryKey: ['bookings', 'freelancer', 'by-date', date],
    queryFn: () => bookingApi.getFreelancerAppointmentsByDate(date!),
    enabled: !!date,
    select: (data) => {
      // Map bookings to appointments format
      const bookings = data.data || [];
      return bookings.map((booking: Booking) => ({
        id: booking.id,
        title:
          booking.services && booking.services.length > 0
            ? booking.services.map((s) => s.name).join(', ')
            : 'General Session',
        start: booking.slot.startTime,
        end: booking.slot.endTime,
        status: booking.status,
        clientName: booking.client.name,
        description:
          (booking.formData?.['notes'] as string) ||
          (booking.formData?.['description'] as string) ||
          '',
        location: booking.slot.locationType,
        notes: (booking.formData?.['notes'] as string) || '',
        locationType: booking.slot.locationType,
        clientAddress: (booking.formData?.['clientAddress'] as string) || undefined,
        freelancer: booking.slot.freelancer,
        clientId: booking.clientId,
      }));
    },
  });
};

/**
 * Hook to fetch today's bookings for freelancer
 */
export const useTodayBookingsFreelancer = () => {
  return useQuery({
    queryKey: ['bookings', 'freelancer', 'today'],
    queryFn: () => bookingApi.getTodayBookingsFreelancer(),
    select: (data) => data.data as Booking[],
  });
};

/**
 * Hook to update booking notes
 */
export const useUpdateBookingNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: string; notes: string }) =>
      bookingApi.updateBookingNotes(bookingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'freelancer', 'by-date'] });
    },
  });
};
