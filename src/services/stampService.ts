import {
  ApiResponse,
  BulkTherapistStampConfigDto,
  CreateTherapistStampConfigDto,
  TherapistStampConfig,
  TherapistStampDetail,
  TherapistStampSummary,
  UpdateTherapistStampConfigDto,
} from '@/types/types';

import api from './api';
import { ENDPOINTS } from './endpoints';

// Patient-facing stamp services
export const stampService = {
  // Get all therapist stamp summaries for the authenticated patient
  getPatientStamps: async (): Promise<ApiResponse<TherapistStampSummary[]>> => {
    const response = await api.get(ENDPOINTS.loyalty.stamps);
    return response.data;
  },

  // Get detailed stamp information for a specific therapist
  getStampDetail: async (therapistId: string): Promise<ApiResponse<TherapistStampDetail>> => {
    const response = await api.get(ENDPOINTS.loyalty.stampDetail(therapistId));
    return response.data;
  },
};

// Admin-facing stamp config services
export const stampConfigService = {
  // Get all therapist stamp configurations
  getAllConfigs: async (): Promise<ApiResponse<TherapistStampConfig[]>> => {
    const response = await api.get(ENDPOINTS.loyalty.stampConfig);
    return response.data;
  },

  // Get stamp configuration for a specific therapist
  getConfigByTherapist: async (therapistId: string): Promise<ApiResponse<TherapistStampConfig>> => {
    const response = await api.get(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId));
    return response.data;
  },

  // Create or update stamp configuration for a therapist
  createOrUpdateConfig: async (
    dto: CreateTherapistStampConfigDto,
  ): Promise<ApiResponse<TherapistStampConfig>> => {
    const response = await api.post(ENDPOINTS.loyalty.stampConfig, dto);
    return response.data;
  },

  // Update stamp configuration for a therapist
  updateConfig: async (
    therapistId: string,
    dto: UpdateTherapistStampConfigDto,
  ): Promise<ApiResponse<TherapistStampConfig>> => {
    const response = await api.patch(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId), dto);
    return response.data;
  },

  // Delete stamp configuration for a therapist
  deleteConfig: async (therapistId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(ENDPOINTS.loyalty.stampConfigByTherapist(therapistId));
    return response.data;
  },

  // Bulk update stamp configuration for all therapists
  bulkUpdateConfigs: async (
    dto: BulkTherapistStampConfigDto,
  ): Promise<ApiResponse<{ updatedCount: number }>> => {
    const response = await api.post(ENDPOINTS.loyalty.stampConfigBulk, dto);
    return response.data;
  },
};

export default stampService;
