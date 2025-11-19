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

// Upload verification document (single file - kept for backward compatibility)
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

// Upload multiple verification documents in a single batch
export const uploadVerificationDocumentsBatch = createAsyncThunk(
  'imageUpload/uploadVerificationDocumentsBatch',
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      // Append all files to FormData with the same field name 'documents'
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await api.post(ENDPOINTS.image.uploadVerificationDocument, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Backend should return an array of results
      return response.data as FileUploadResponse | FileUploadResponse[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload verification documents',
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
