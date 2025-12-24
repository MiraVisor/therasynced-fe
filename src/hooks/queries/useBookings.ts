import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as bookingApi from '@/services/bookingService';
import { Booking, CancelBookingDto, CreateBookingDto, RescheduleBookingDto } from '@/types/types';

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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
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
