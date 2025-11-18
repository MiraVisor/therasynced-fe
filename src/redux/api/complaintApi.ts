import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { Complaint, CreateComplaintDto } from '@/types/types';

// Create a complaint
export const createComplaint = createAsyncThunk(
  'complaint/create',
  async (data: CreateComplaintDto, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.complaint.create, data);
      return response.data.data as Complaint;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create complaint');
    }
  },
);

// Get my complaints
export const getMyComplaints = createAsyncThunk(
  'complaint/getMyComplaints',
  async (filters: { status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = filters.status ? `?status=${filters.status}` : '';
      const response = await api.get(`${ENDPOINTS.complaint.myComplaints}${queryParams}`);
      return response.data.data as Complaint[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get complaints');
    }
  },
);

// Get complaints against me
export const getComplaintsAgainstMe = createAsyncThunk(
  'complaint/getAgainstMe',
  async (filters: { status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = filters.status ? `?status=${filters.status}` : '';
      const response = await api.get(`${ENDPOINTS.complaint.againstMe}${queryParams}`);
      return response.data.data as Complaint[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get complaints');
    }
  },
);

// Get complaint details
export const getComplaintDetails = createAsyncThunk(
  'complaint/getDetails',
  async (complaintId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.complaint.detail(complaintId));
      return response.data.data as Complaint;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get complaint details');
    }
  },
);
