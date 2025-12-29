import api from './api';
import { ENDPOINTS } from './endpoints';

export interface ToggleFreelancerStatusRequest {
  isActive: boolean;
  reason?: string;
}

export interface ToggleFreelancerStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    reason?: string;
  };
}

const adminFreelancerService = {
  /**
   * Toggle freelancer active status
   * @param freelancerId - UUID of the freelancer
   * @param data - Status toggle data with isActive flag and optional reason
   */
  toggleStatus: async (
    freelancerId: string,
    data: ToggleFreelancerStatusRequest,
  ): Promise<ToggleFreelancerStatusResponse> => {
    const response = await api.patch<ToggleFreelancerStatusResponse>(
      ENDPOINTS.admin.verification.toggleStatus(freelancerId),
      data,
    );
    return response.data;
  },
};

export default adminFreelancerService;
