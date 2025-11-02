import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { FileUploadResponse } from '@/types/types';

// Upload single image
export const uploadSingleImage = createAsyncThunk(
  'imageUpload/uploadSingle',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(ENDPOINTS.image.uploadSingle, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as FileUploadResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  },
);

// Upload verification document
export const uploadVerificationDocument = createAsyncThunk(
  'imageUpload/uploadVerificationDocument',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('documents', file);

      const response = await api.post(ENDPOINTS.image.uploadVerificationDocument, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as FileUploadResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload verification document',
      );
    }
  },
);

// Upload first-aid certificate
export const uploadFirstAidCertificate = createAsyncThunk(
  'imageUpload/uploadFirstAidCertificate',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await api.post(ENDPOINTS.image.uploadFirstAidCertificate, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as FileUploadResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload certificate');
    }
  },
);

// Delete an image
export const deleteImage = createAsyncThunk(
  'imageUpload/delete',
  async (publicId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(ENDPOINTS.image.deleteSingle(publicId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete image');
    }
  },
);
