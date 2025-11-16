import { PaginationDto } from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface CreateServiceCategoryDto {
  name: string;
  description?: string;
  jobTitleId: string;
}

export interface UpdateServiceCategoryDto {
  name?: string;
  description?: string;
  jobTitleId?: string;
  isActive?: boolean;
}

export interface ServiceCategoryResponse {
  id: string;
  name: string;
  description?: string;
  jobTitle: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedServiceCategoriesResponse {
  jobTitleId: string;
  jobTitleName: string;
  categories: ServiceCategoryResponse[];
}

export interface ServiceCategoryStatsResponse {
  totalServiceCategories: number;
  activeServiceCategories: number;
  inactiveServiceCategories: number;
  jobTitleWithMostCategories: {
    jobTitleId: string;
    jobTitleName: string;
    categoryCount: number;
  } | null;
}

const adminServiceCategoryService = {
  // Create service category
  create: async (data: CreateServiceCategoryDto) => {
    const response = await api.post(ENDPOINTS.admin.serviceCategories.create, data);
    return response.data;
  },

  // Get all service categories
  getAll: async (pagination?: PaginationDto) => {
    const response = await api.get(ENDPOINTS.admin.serviceCategories.getAll, {
      params: pagination,
    });
    return response.data;
  },

  // Get service categories stats
  getStats: async () => {
    const response = await api.get(ENDPOINTS.admin.serviceCategories.stats);
    return response.data;
  },

  // Get grouped by job title
  getGrouped: async () => {
    const response = await api.get(ENDPOINTS.admin.serviceCategories.getGrouped);
    return response.data;
  },

  // Get by job title ID
  getByJobTitle: async (jobTitleId: string) => {
    const response = await api.get(ENDPOINTS.admin.serviceCategories.getByJobTitle(jobTitleId));
    return response.data;
  },

  // Get service category by ID
  getById: async (id: string) => {
    const response = await api.get(ENDPOINTS.admin.serviceCategories.getById(id));
    return response.data;
  },

  // Update service category
  update: async (id: string, data: UpdateServiceCategoryDto) => {
    const response = await api.patch(ENDPOINTS.admin.serviceCategories.update(id), data);
    return response.data;
  },

  // Delete/deactivate service category
  delete: async (id: string) => {
    const response = await api.delete(ENDPOINTS.admin.serviceCategories.delete(id));
    return response.data;
  },
};

export default adminServiceCategoryService;
