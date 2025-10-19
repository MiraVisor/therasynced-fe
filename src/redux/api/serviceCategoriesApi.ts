import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { JobTitle, ServiceCategory } from '@/types/types';

// Get all service categories
export const getAllServiceCategories = createAsyncThunk(
  'serviceCategories/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.serviceCategories.getAll);
      return response.data.data as ServiceCategory[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get service categories');
    }
  },
);

// Get service categories by job title
export const getServiceCategoriesByJobTitle = createAsyncThunk(
  'serviceCategories/getByJobTitle',
  async (jobTitle: JobTitle, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.serviceCategories.getByJobTitle(jobTitle));
      return response.data.data as ServiceCategory[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get service categories for job title',
      );
    }
  },
);
