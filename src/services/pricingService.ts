import api from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  FreelancerPricing,
  UpdateDurationPricingRequest,
  UpdateServicePricingRequest,
} from '@/types/pricing';

export const getFreelancerPricing = async (): Promise<ApiResponse<FreelancerPricing>> => {
  const response = await api.get('/freelancer/pricing');
  return response.data;
};

export const updateServicePricing = async (
  data: UpdateServicePricingRequest,
): Promise<ApiResponse<{ servicePricing: FreelancerPricing['servicePricing'] }>> => {
  const response = await api.post('/freelancer/pricing/services', data);
  return response.data;
};

export const updateDurationPricing = async (
  data: UpdateDurationPricingRequest,
): Promise<ApiResponse<{ durationPricing: FreelancerPricing['durationPricing'] }>> => {
  const response = await api.post('/freelancer/pricing/durations', data);
  return response.data;
};
