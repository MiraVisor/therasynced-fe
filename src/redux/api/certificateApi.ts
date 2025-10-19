import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { FirstAidCertificateInfo, FirstAidCertificateStatus } from '@/types/types';
import { uploadFile } from '@/utils/fileUpload';

// Upload first aid certificate
export const uploadFirstAidCertificate = createAsyncThunk(
  'certificate/upload',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      // Step 1: Upload file to Cloudinary via backend
      const uploadResult = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        uploadType: 'first-aid-certificate',
      });

      if (!uploadResult.success || !uploadResult.url) {
        return rejectWithValue(uploadResult.error || 'Upload failed');
      }

      // Step 2: Send certificate URL to backend
      const response = await api.post(ENDPOINTS.certificate.upload, {
        certificateUrl: uploadResult.url,
      });

      return {
        url: uploadResult.url,
        status: response.data.data?.status || 'PENDING',
        fileId: uploadResult.fileId,
        publicId: uploadResult.publicId,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload certificate');
    }
  },
);

// Get first aid certificate status
export const getFirstAidCertificateStatus = createAsyncThunk(
  'certificate/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.certificate.status);
      return response.data.data as FirstAidCertificateInfo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get certificate status');
    }
  },
);

// Update certificate status (admin action)
export const updateCertificateStatus = createAsyncThunk(
  'certificate/updateStatus',
  async (
    data: {
      status: FirstAidCertificateStatus;
      rejectionReason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch('/admin/certificate/status', data);
      return response.data.data as FirstAidCertificateInfo;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update certificate status',
      );
    }
  },
);

// Delete certificate
export const deleteCertificate = createAsyncThunk(
  'certificate/delete',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/freelancer/first-aid-certificate');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete certificate');
    }
  },
);
