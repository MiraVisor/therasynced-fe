import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { JobTitlesResponse } from '@/types/types';

export const jobTitleService = {
  async getActiveJobTitles(): Promise<JobTitlesResponse> {
    try {
      const response = await api.get(ENDPOINTS.jobTitles.getAll);

      // Handle the actual response structure
      const responseData = response.data;
      if (responseData.success && Array.isArray(responseData.data)) {
        return {
          success: true,
          data: responseData.data,
        };
      }

      // If no job titles exist, return empty array
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      // Return empty array instead of throwing error to prevent UI crashes
      return {
        success: false,
        data: [],
      };
    }
  },
};
