import api from '@/services/api';
import {
  ApiResponse,
  CreateSlotsDto,
  PaginationDto,
  ReserveSlotDto,
  Slot,
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
  const response = await api.post('/slot/get', { id });
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
