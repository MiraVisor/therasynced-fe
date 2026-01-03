import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import type { SlotPatternResponse } from '@/types/slot';
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

export const deleteDaySlots = async (
  date: string,
  deleteByDayOfWeek?: boolean,
): Promise<ApiResponse<{ deletedCount: number; date: string }>> => {
  const params = deleteByDayOfWeek ? { deleteByDayOfWeek: 'true' } : undefined;
  const response = await api.delete(`/slot/day/${date}`, { params });
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

export const getMySlots = async (
  params: PaginationDto & {
    freelancerId?: string;
    weekStart?: string;
    weekEnd?: string;
  },
): Promise<ApiResponse<Slot[]>> => {
  const response = await api.post('/slot/my-slots', params);
  return response.data;
};

export const getMySlotsStats = async (): Promise<ApiResponse<SlotStats>> => {
  const response = await api.get('/slot/stats/my-slots');
  return response.data;
};

export const getAvailableSlots = async (
  freelancerId: string,
  params?: {
    date?: string; // ISO date format YYYY-MM-DD
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
): Promise<ApiResponse<Slot[]>> => {
  const response = await api.get(`/slot/available/${freelancerId}`, { params });
  return response.data;
};

/**
 * Get available slots by date (across all freelancers or filtered by freelancer)
 */
export const getAvailableSlotsByDate = async (params: {
  date: string; // ISO date format YYYY-MM-DD (required)
  freelancerId?: string; // Optional: Filter by specific freelancer
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Slot[]>> => {
  const response = await api.get('/slot/available-by-date', { params });
  return response.data;
};

/**
 * Get slot pattern from last week for pattern recognition
 */
export const getLastWeekPattern = async (params?: {
  weekStart?: string; // ISO date string, defaults to last week
}): Promise<SlotPatternResponse> => {
  const response = await api.get(ENDPOINTS.slots.lastWeekPattern, { params });
  return response.data;
};
