import api from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { BlockDatesDto, BlockedDatesResponse, UnblockDatesDto } from '@/types/availability';

export const getBlockedDates = async (): Promise<ApiResponse<BlockedDatesResponse>> => {
  const response = await api.get('/freelancer/availability/blocked-days');
  return response.data;
};

export const blockDates = async (
  data: BlockDatesDto,
): Promise<ApiResponse<BlockedDatesResponse>> => {
  const response = await api.post('/freelancer/availability/block-days', data);
  return response.data;
};

export const unblockDates = async (
  data: UnblockDatesDto,
): Promise<ApiResponse<BlockedDatesResponse>> => {
  const response = await api.delete('/freelancer/availability/block-days', { data });
  return response.data;
};
