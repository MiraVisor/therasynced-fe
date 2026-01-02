import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as slotApi from '@/services/slotService';
import { getApiErrorMessage } from '@/types/common';
import { CreateSlotsDto, PaginationDto, ReserveSlotDto, UpdateSlotDto } from '@/types/types';

/**
 * Hook to fetch slots with pagination
 */
export const useSlots = (params: PaginationDto) => {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () => slotApi.getSlots(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch my slots (freelancer)
 */
export const useMySlots = (
  params: PaginationDto & {
    freelancerId?: string;
    weekStart?: string;
    weekEnd?: string;
  },
) => {
  return useQuery({
    queryKey: ['slots', 'my-slots', params],
    queryFn: () => slotApi.getMySlots(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch slot stats
 */
export const useSlotStats = () => {
  return useQuery({
    queryKey: ['slots', 'stats'],
    queryFn: () => slotApi.getMySlotsStats(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
};

/**
 * Hook to fetch a single slot
 */
export const useSlot = (id: string | null) => {
  return useQuery({
    queryKey: ['slot', id],
    queryFn: () => slotApi.getSlot(id!),
    enabled: !!id,
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch available slots for a freelancer
 */
export const useAvailableSlots = (
  freelancerId: string | null,
  params?: {
    date?: string; // ISO date format YYYY-MM-DD
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
) => {
  return useQuery({
    queryKey: ['slots', 'available', freelancerId, params],
    queryFn: () => slotApi.getAvailableSlots(freelancerId!, params),
    enabled: !!freelancerId,
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch available slots by date (across all freelancers or filtered)
 */
export const useAvailableSlotsByDate = (params: {
  date: string; // ISO date format YYYY-MM-DD (required)
  freelancerId?: string; // Optional: Filter by specific freelancer
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['slots', 'available-by-date', params],
    queryFn: () => slotApi.getAvailableSlotsByDate(params),
    enabled: !!params.date,
    select: (data) => data.data,
  });
};

/**
 * Hook to create slots
 */
export const useCreateSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlotsDto) => slotApi.createSlot(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
      // Removed toast - components handle their own toasts with more specific messages
    },
    onError: () => {
      // Removed toast - components handle their own error toasts
    },
  });
};

/**
 * Alias for useCreateSlots (for backward compatibility)
 */
export const useCreateSlot = useCreateSlots;

/**
 * Hook to update a slot
 */
export const useUpdateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSlotDto) => slotApi.updateSlot(data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
      void queryClient.invalidateQueries({ queryKey: ['slot', variables.id] });
      toast.success('Slot updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to update slot');
    },
  });
};

/**
 * Hook to delete a slot
 */
export const useDeleteSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slotApi.deleteSlot(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
      toast.success('Slot deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to delete slot');
    },
  });
};

/**
 * Hook to delete all slots for a specific day
 */
export const useDeleteDaySlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, deleteByDayOfWeek }: { date: string; deleteByDayOfWeek?: boolean }) =>
      slotApi.deleteDaySlots(date, deleteByDayOfWeek),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
      const deletedCount = data.data?.deletedCount ?? 0;
      if (deletedCount > 0) {
        if (variables.deleteByDayOfWeek) {
          const dayName = new Date(variables.date).toLocaleDateString('en-US', { weekday: 'long' });
          toast.success(`Successfully deleted ${deletedCount} slot(s) for all future ${dayName}s`);
        } else {
          toast.success(`Successfully deleted ${deletedCount} slot(s) for ${data.data?.date}`);
        }
      } else {
        toast.info('No slots found for the specified criteria');
      }
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || 'Failed to delete slots');
    },
  });
};

/**
 * Hook to reserve a slot
 */
export const useReserveSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReserveSlotDto) => slotApi.reserveSlot(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error) || 'Failed to reserve slot');
    },
  });
};
