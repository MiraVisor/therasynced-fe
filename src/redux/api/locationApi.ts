import api from '@/services/api';
import { CreateLocationDto } from '@/types/types';

export const createLocation = async (data: CreateLocationDto) => {
  const response = await api.post('/location/create', data);
  return response.data;
};

export const getLocations = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/location', { params });
  return response.data;
};

export const updateLocation = async (id: string, data: Partial<CreateLocationDto>) => {
  const response = await api.patch(`/location/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id: string) => {
  const response = await api.delete(`/location/${id}`);
  return response.data;
};
