import api from '@/services/api';
import { ApiResponse, Expert } from '@/types/types';

import {
  changeEmail,
  changePassword,
  deleteProfile,
  getProfile,
  updateProfile,
} from './profileApi';

export const getAllFreelancers = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ApiResponse<Expert[]>> => {
  console.log('API call params:', params);
  const response = await api.get('/freelancer/all', { params });
  console.log('Raw API response:', response.data);
  console.log('Meta object:', response.data.meta);

  // The backend returns data in a different format
  // We need to extract pagination from meta or construct it
  const result = {
    success: true,
    data: response.data.data,
    pagination: response.data.pagination ||
      response.data.meta?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 2,
        total: response.data.data.length, // This is just the current page count
        totalPages: 1, // We'll need to get this from the backend
        hasNext: false, // We'll need to get this from the backend
        hasPrev: false,
      },
    meta: response.data.meta,
  };
  console.log('Processed API response:', result);
  return result;
};

export const favoriteFreelancer = async (freelancerId: string) => {
  const response = await api.post('/freelancer/favorite', { freelancerId });
  return response.data;
};

export const getFreelancerSlots = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  freelancerId?: string;
}) => {
  // Send freelancerId as a top-level param, not inside params object
  const { freelancerId, ...rest } = params;
  const response = await api.post('/slot/list', { ...rest, freelancerId });
  return response.data;
};

export const reserveSlot = async (slotId: string) => {
  const response = await api.post('/slot/reserve', { slotId });
  return response.data;
};

export const createBooking = async (data: {
  slotId: string;
  serviceIds?: string[];
  clientId?: string;
  clientAddress?: string;
  notes?: string;
}) => {
  const response = await api.post('/booking/create', data);
  return response.data;
};

export const getFreelancerServices = async (freelancerId: string) => {
  const response = await api.get(`/freelancer/${freelancerId}/services`);
  return response.data;
};

// Re-export profile functions for backward compatibility
export {
  changeEmail,
  deleteProfile,
  getProfile as getUserProfile,
  changePassword as updatePassword,
  updateProfile as updateUserProfile,
};
