import { PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface CreateJobTitleDto {
  name: string;
  description?: string;
}

export interface UpdateJobTitleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface JobTitleResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: {
    serviceCategories: number;
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobTitlesListResponse {
  success: boolean;
  data: JobTitleResponse[];
  total?: number;
}

const adminJobTitleService = {
  // Create job title
  create: async (data: CreateJobTitleDto) => {
    const response = await api.post(ENDPOINTS.admin.jobTitles.create, data);
    return response.data;
  },

  // Get all job titles
  getAll: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.jobTitles.getAll, {
      params: pagination,
    });
    return response.data;
  },

  // Get active job titles only
  getActive: async () => {
    const response = await api.get(ENDPOINTS.admin.jobTitles.getActive);
    return response.data;
  },

  // Get job title by ID
  getById: async (id: string) => {
    const response = await api.get(ENDPOINTS.admin.jobTitles.getById(id));
    return response.data;
  },

  // Update job title
  update: async (id: string, data: UpdateJobTitleDto) => {
    const response = await api.patch(ENDPOINTS.admin.jobTitles.update(id), data);
    return response.data;
  },

  // Delete/deactivate job title
  delete: async (id: string) => {
    const response = await api.delete(ENDPOINTS.admin.jobTitles.delete(id));
    return response.data;
  },
};

export default adminJobTitleService;
