import { useCallback, useEffect, useRef, useState } from 'react';

import adminBookingsService, { AdminBookingDto } from '@/services/adminBookingsService';
import bookingService from '@/services/bookingService';
import { ApiResponse, Booking, PaginationDto } from '@/types/types';

interface UseBookingsOptions {
  includePast?: boolean;
  date?: string;
  pagination?: PaginationDto;
}

interface UseAdminBookingsParams {
  limit?: number;
  page?: number;
  search?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useAdminBookings = (params?: UseAdminBookingsParams) => {
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // Track if this is the first load
  const isFirstLoad = useRef(true);

  const fetchBookings = useCallback(async () => {
    try {
      // Only set loading to true for subsequent loads, not initial load
      if (!isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      const response = await adminBookingsService.getAll({
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      });

      setBookings(response.bookings);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching bookings');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isFirstLoad.current = false;
    }
  }, [params?.page, params?.limit, params?.search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    initialLoading,
    error,
    pagination,
    refetch: fetchBookings,
  };
};

export const usePatientBookings = (options: UseBookingsOptions = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getPatientBookings(options.date, options.includePast);

      if (response.success) {
        setBookings(response.data);
        setMeta(response.meta);
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  }, [options.date, options.includePast]);

  const fetchBookingHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getPatientBookingHistory(options.pagination);

      if (response.success) {
        setBookings(response.data);
        setMeta(response.meta);
      } else {
        setError(response.message || 'Failed to fetch booking history');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching booking history');
    } finally {
      setLoading(false);
    }
  }, [options.pagination]);

  useEffect(() => {
    if (options.includePast) {
      fetchBookingHistory();
    } else {
      fetchBookings();
    }
  }, [fetchBookings, fetchBookingHistory, options.includePast]);

  const createBooking = useCallback(
    async (bookingData: any) => {
      try {
        const response = await bookingService.createBooking(bookingData);
        if (response.success) {
          // Refresh bookings after creating new one
          await fetchBookings();
          return response.data;
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to create booking');
      }
    },
    [fetchBookings],
  );

  const cancelBooking = useCallback(
    async (bookingId: string, reason: string) => {
      try {
        const response = await bookingService.cancelBooking({ bookingId, reason });
        if (response.success) {
          // Refresh bookings after cancellation
          await fetchBookings();
          return response.data;
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to cancel booking');
      }
    },
    [fetchBookings],
  );

  const rescheduleBooking = useCallback(
    async (bookingId: string, newSlotId: string) => {
      try {
        const response = await bookingService.rescheduleBooking({ bookingId, newSlotId });
        if (response.success) {
          // Refresh bookings after rescheduling
          await fetchBookings();
          return response.data;
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to reschedule booking');
      }
    },
    [fetchBookings],
  );

  return {
    bookings,
    loading,
    error,
    meta,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    refetch: fetchBookings,
  };
};

export const useFreelancerBookings = (pagination?: PaginationDto) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchFutureBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getFreelancerFutureBookings(pagination);

      if (response.success) {
        setBookings(response.data);
        setMeta(response.meta);
      } else {
        setError(response.message || 'Failed to fetch future bookings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching future bookings');
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  const fetchBookingHistory = useCallback(
    async (includePast: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const response = await bookingService.getFreelancerHistory(pagination, includePast);

        if (response.success) {
          setBookings(response.data);
          setMeta(response.meta);
        } else {
          setError(response.message || 'Failed to fetch booking history');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching booking history');
      } finally {
        setLoading(false);
      }
    },
    [pagination],
  );

  const fetchTodayBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getFreelancerTodayBookings();

      if (response.success) {
        setBookings(response.data);
        setMeta(response.meta);
      } else {
        setError(response.message || "Failed to fetch today's bookings");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching today's bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    meta,
    fetchFutureBookings,
    fetchBookingHistory,
    fetchTodayBookings,
  };
};
