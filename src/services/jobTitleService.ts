import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { JobTitlesResponse } from '@/types/types';

export const jobTitleService = {
  async getActiveJobTitles(): Promise<JobTitlesResponse> {
    try {
      // Use public endpoint - no auth required
      const response = await api.get(ENDPOINTS.public.jobTitles);

      // Handle the actual response structure
      const responseData = response.data;

      console.log('Job titles API response:', responseData);

      // Check if response is directly an array
      if (Array.isArray(responseData)) {
        console.log(`Found ${responseData.length} job titles (direct array)`);
        return {
          success: true,
          data: responseData,
        };
      }

      // Check if response has success and data fields
      if (responseData.success && Array.isArray(responseData.data)) {
        console.log(`Found ${responseData.data.length} job titles (success.data)`);
        return {
          success: true,
          data: responseData.data,
        };
      }

      // Check if response has data field that's an array
      if (Array.isArray(responseData.data)) {
        console.log(`Found ${responseData.data.length} job titles (data field)`);
        return {
          success: true,
          data: responseData.data,
        };
      }

      console.warn('Unexpected job titles response structure:', responseData);
      // If no job titles exist, return empty array
      return {
        success: true,
        data: [],
      };
    } catch (error: any) {
      console.error('Error fetching job titles:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return {
        success: false,
        data: [],
      };
    }
  },
};
