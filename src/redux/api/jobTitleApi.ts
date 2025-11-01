import { createAsyncThunk } from '@reduxjs/toolkit';

import { jobTitleService } from '@/services/jobTitleService';
import { JobTitle } from '@/types/types';

// Get all active job titles
export const getActiveJobTitles = createAsyncThunk(
  'jobTitles/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobTitleService.getActiveJobTitles();
      return response.data as JobTitle[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get job titles');
    }
  },
);
