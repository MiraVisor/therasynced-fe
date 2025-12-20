import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as slotApi from '@/services/slotService';
import {
  CreateSlotsDto,
  PaginationDto,
  ReserveSlotDto,
  Slot,
  SlotStats,
  UpdateSlotDto,
} from '@/types/types';

/**
 * Hook to fetch slots with pagination
 */
export const useSlots = (params: PaginationDto) => {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: () => slotApi.getSlots(params),
    select: (data) => data.data as Slot[],
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
    select: (data) => data.data as Slot[],
  });
};

/**
 * Hook to fetch slot stats
 */
export const useSlotStats = () => {
  return useQuery({
    queryKey: ['slots', 'stats'],
    queryFn: () => slotApi.getMySlotsStats(),
    select: (data) => data.data as SlotStats,
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
    select: (data) => data.data as Slot,
  });
};

/**
 * Hook to fetch available slots for a freelancer
 */
export const useAvailableSlots = (freelancerId: string | null) => {
  return useQuery({
    queryKey: ['slots', 'available', freelancerId],
    queryFn: () => slotApi.getAvailableSlots(freelancerId!),
    enabled: !!freelancerId,
    select: (data) => data.data as Slot[],
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
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      toast.success('Slots created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create slots');
    },
  });
};

/**
 * Hook to update a slot
 */
export const useUpdateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSlotDto) => slotApi.updateSlot(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['slot', variables.id] });
      toast.success('Slot updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update slot');
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
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      toast.success('Slot deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete slot');
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
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reserve slot');
    },
  });
};
