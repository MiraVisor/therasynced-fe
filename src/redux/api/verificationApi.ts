import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  BackendFile,
  FreelancerFile,
  FreelancerFileType,
  FreelancerFilesResponse,
} from '@/types/types';
import { uploadFile } from '@/utils/fileUpload';

interface VerificationDocument {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  publicId?: string;
}

// Upload verification document
export const uploadVerificationDocument = createAsyncThunk(
  'verification/uploadDocument',
  async (file: File, { rejectWithValue }) => {
    try {
      // Step 1: Upload file to Cloudinary via backend
      const uploadResult = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        uploadType: 'verification-document',
      });

      if (!uploadResult.success || !uploadResult.url) {
        return rejectWithValue(uploadResult.error || 'Upload failed');
      }

      // Step 2: Send document URL to backend
      const response = await api.post(ENDPOINTS.verification.uploadDocument, {
        documentUrl: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
      });

      return {
        id: response.data.data?.id || uploadResult.fileId,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        publicId: uploadResult.publicId,
      } as VerificationDocument;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  },
);

// Get verification documents
export const getVerificationDocuments = createAsyncThunk(
  'verification/getDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.verification.getDocuments);
      return response.data.data as VerificationDocument[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get verification documents',
      );
    }
  },
);

// Delete verification document
export const deleteVerificationDocument = createAsyncThunk(
  'verification/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(ENDPOINTS.verification.deleteDocument(documentId));
      return { documentId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  },
);

// Helper function to transform backend response to flat array
const transformBackendFilesToArray = (
  backendResponse: FreelancerFilesResponse,
): FreelancerFile[] => {
  const files: FreelancerFile[] = [];

  // Add profile picture if exists
  if (backendResponse.profilePicture) {
    files.push({
      id: `profile-${Date.now()}`,
      fileName: backendResponse.profilePicture.originalName || 'Profile Picture',
      fileType: 'PROFILE_PICTURE' as FreelancerFileType,
      url: backendResponse.profilePicture.url,
      fileSize: backendResponse.profilePicture.fileSize,
      uploadedAt: backendResponse.profilePicture.uploadedAt,
      format: backendResponse.profilePicture.format,
    });
  }

  // Add first aid certificate if exists
  if (backendResponse.firstAidCertificate) {
    files.push({
      id: `certificate-${Date.now()}`,
      fileName: backendResponse.firstAidCertificate.originalName || 'First Aid Certificate',
      fileType: 'CERTIFICATE' as FreelancerFileType,
      url: backendResponse.firstAidCertificate.url,
      fileSize: backendResponse.firstAidCertificate.fileSize,
      uploadedAt: backendResponse.firstAidCertificate.uploadedAt,
      status: backendResponse.firstAidCertificate.status,
      format: backendResponse.firstAidCertificate.format,
      approvedAt: backendResponse.firstAidCertificate.approvedAt,
      rejectedAt: backendResponse.firstAidCertificate.rejectedAt,
      rejectionReason: backendResponse.firstAidCertificate.rejectionReason,
    });
  }

  // Add verification documents if exist
  if (backendResponse.verificationDocuments && backendResponse.verificationDocuments.length > 0) {
    backendResponse.verificationDocuments.forEach((doc, index) => {
      files.push({
        id: `verification-${index}-${Date.now()}`,
        fileName: doc.originalName || `Verification Document ${index + 1}`,
        fileType: 'VERIFICATION_DOCUMENT' as FreelancerFileType,
        url: doc.url,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        status: doc.status,
        format: doc.format,
        approvedAt: doc.approvedAt,
        rejectedAt: doc.rejectedAt,
        rejectionReason: doc.rejectionReason,
      });
    });
  }

  return files;
};

// Get all freelancer files
export const getFreelancerFiles = createAsyncThunk(
  'verification/getFreelancerFiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.freelancer.files);
      const backendData = response.data.data as FreelancerFilesResponse;
      return transformBackendFilesToArray(backendData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get freelancer files');
    }
  },
);

// Get verification status
export const getVerificationStatus = createAsyncThunk(
  'verification/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.verification.status);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get verification status');
    }
  },
);

// Request verification
export const requestVerification = createAsyncThunk(
  'verification/request',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.verification.requestVerification);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request verification');
    }
  },
);

// Update verification status (admin action)
export const updateVerificationStatus = createAsyncThunk(
  'verification/updateStatus',
  async (
    data: {
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch('/admin/verification/status', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update verification status',
      );
    }
  },
);
