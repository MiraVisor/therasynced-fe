import api from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  FreelancerPricing,
  UpdateDurationPricingRequest,
  UpdateLocationPricingRequest,
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

export const updateLocationPricing = async (
  data: UpdateLocationPricingRequest,
): Promise<ApiResponse<{ servicePricing: FreelancerPricing['servicePricing'] }>> => {
  const response = await api.post('/freelancer/pricing/services/locations', data);
  return response.data;
};

export const updateDurationPricing = async (
  data: UpdateDurationPricingRequest,
): Promise<ApiResponse<{ durationPricing: FreelancerPricing['durationPricing'] }>> => {
  const response = await api.post('/freelancer/pricing/durations', data);
  return response.data;
};

export const deleteLocationPricing = async (
  serviceCategoryId: string,
  locationType: 'HOME' | 'CLINIC',
): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete(
    `/freelancer/pricing/services/locations/${serviceCategoryId}/${locationType}`,
  );
  return response.data;
};
