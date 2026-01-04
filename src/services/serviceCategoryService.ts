import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { ApiResponse, ServiceCategory } from '@/types/types';

/**
 * Get all service categories
 * @param params - Optional query parameters
 * - slotId: Get services available for specific slot
 * - freelancerId: Get services for specific freelancer (includes locationTypes)
 */
export const getAllServiceCategories = async (params?: {
  slotId?: string; // Get services available for specific slot
  freelancerId?: string; // Get services for specific freelancer (includes locationTypes)
}): Promise<ApiResponse<ServiceCategory[]>> => {
  const response = await api.get(ENDPOINTS.serviceCategories.getAll, { params });
  return {
    success: true,
    data: response.data.data || [],
    meta: response.data.meta || {
      timestamp: new Date().toISOString(),
      path: ENDPOINTS.serviceCategories.getAll,
    },
  };
};

/**
 * Get service categories by job title
 */
export const getServiceCategoriesByJobTitle = async (
  jobTitleId: string,
): Promise<ApiResponse<ServiceCategory[]>> => {
  const response = await api.get(ENDPOINTS.serviceCategories.getByJobTitle(jobTitleId));
  return {
    success: true,
    data: response.data.data || [],
    meta: response.data.meta || {
      timestamp: new Date().toISOString(),
      path: ENDPOINTS.serviceCategories.getByJobTitle(jobTitleId),
    },
  };
};

const serviceCategoryService = {
  getAll: getAllServiceCategories,
  getByJobTitle: getServiceCategoriesByJobTitle,
};

export default serviceCategoryService;
