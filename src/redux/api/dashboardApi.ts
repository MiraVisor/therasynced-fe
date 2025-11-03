import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { FreelancerDashboardOverviewResponse } from '@/types/types';

// Get freelancer dashboard overview
export const getFreelancerDashboardOverview =
  async (): Promise<FreelancerDashboardOverviewResponse> => {
    const response = await api.get(ENDPOINTS.dashboard.freelancerOverview);
    return response.data;
  };
