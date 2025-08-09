import api from '@/services/api';
import { CreateServiceDto } from '@/types/types';

export const createService = async (data: CreateServiceDto) => {
  const response = await api.post('/service/create', data);
  return response.data;
};

export const getServices = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await api.get('/service', { params });
  return response.data;
};

export const getServiceById = async (id: string) => {
  const response = await api.get(`/service/${id}`);
  return response.data;
};

export const updateService = async (id: string, data: Partial<CreateServiceDto>) => {
  const response = await api.patch(`/service/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/service/${id}`);
  return response.data;
};

// Get public services for a freelancer
export const getFreelancerServices = async (freelancerId: string) => {
  const response = await api.get(`/service/freelancer/${freelancerId}`);
  return response.data;
};
