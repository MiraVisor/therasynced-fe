import api from '@/services/api';
import {
  ApiResponse,
  CreateSlotsDto,
  PaginationDto,
  ReserveSlotDto,
  Slot,
  SlotStats,
  UpdateSlotDto,
} from '@/types/types';

export const createSlot = async (data: CreateSlotsDto): Promise<ApiResponse<Slot[]>> => {
  const response = await api.post('/slot/create', data);
  return response.data;
};

export const getSlots = async (params: PaginationDto): Promise<ApiResponse<Slot[]>> => {
  const response = await api.post('/slot/list', params);
  return response.data;
};

export const updateSlot = async (data: UpdateSlotDto): Promise<ApiResponse<Slot>> => {
  const response = await api.post('/slot/update', data);
  return response.data;
};

export const deleteSlot = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.post('/slot/delete', { id });
  return response.data;
};

export const getSlot = async (id: string): Promise<ApiResponse<Slot>> => {
  const response = await api.get(`/slot/get/${id}`);
  return response.data;
};

export const reserveSlot = async (
  data: ReserveSlotDto,
): Promise<ApiResponse<{ id: string; reservedUntil: string }>> => {
  const response = await api.post('/slot/reserve', data);
  return response.data;
};

export const checkExpiredReservations = async (): Promise<
  ApiResponse<{ revertedCount: number }>
> => {
  const response = await api.post('/slot/check-expired-reservations');
  return response.data;
};

export const getFreelancerAvailableSlots = async (
  freelancerId: string,
): Promise<ApiResponse<Slot[]>> => {
  const response = await api.get(`/slot/freelancer/${freelancerId}/available`);
  return response.data;
};

export const getBookedSlots = async (params: PaginationDto): Promise<ApiResponse<Slot[]>> => {
  const response = await api.post('/slot/booked-slots', params);
  return response.data;
};

export const getAvailableSlots = async (freelancerId: string): Promise<ApiResponse<Slot[]>> => {
  const response = await api.get(`/slot/available/${freelancerId}`);
  return response.data;
};

export const getMySlots = async (
  params: PaginationDto & {
    freelancerId?: string;
    weekStart?: string;
    weekEnd?: string;
  },
): Promise<ApiResponse<Slot[]>> => {
  const response = await api.post(
    '/slot/list',
    {
      freelancerId: params.freelancerId,
      weekStart: params.weekStart,
      weekEnd: params.weekEnd,
    },
    {
      params: {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy || 'startTime',
        sortOrder: params.sortOrder || 'asc',
      },
    },
  );
  return response.data;
};

export const getMySlotsStats = async (): Promise<
  ApiResponse<import('@/types/types').SlotStats>
> => {
  const response = await api.get('/slot/stats/my-slots');
  return response.data;
};
