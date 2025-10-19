import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { FirstAidCertificateInfo, FirstAidCertificateStatus } from '@/types/types';

interface CertificateState {
  certificate: FirstAidCertificateInfo | null;
  isUploading: boolean;
  uploadProgress: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CertificateState = {
  certificate: null,
  isUploading: false,
  uploadProgress: 0,
  isLoading: false,
  error: null,
};

const certificateSlice = createSlice({
  name: 'certificate',
  initialState,
  reducers: {
    // Start certificate upload
    startUpload: (state) => {
      state.isUploading = true;
      state.uploadProgress = 0;
      state.error = null;
    },

    // Update upload progress
    updateUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },

    // Upload successful
    uploadSuccess: (
      state,
      action: PayloadAction<{
        url: string;
        status: FirstAidCertificateStatus;
      }>,
    ) => {
      state.isUploading = false;
      state.uploadProgress = 100;
      state.certificate = {
        firstAidCertificateUrl: action.payload.url,
        firstAidCertificateStatus: action.payload.status,
        firstAidCertificateApprovedAt: null,
        firstAidCertificateRejectedAt: null,
        firstAidCertificateRejectionReason: null,
      };
      state.error = null;
    },

    // Upload failed
    uploadFailed: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = action.payload;
    },

    // Load certificate data
    loadCertificate: (state, action: PayloadAction<FirstAidCertificateInfo>) => {
      state.certificate = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Update certificate status
    updateCertificateStatus: (
      state,
      action: PayloadAction<{
        status: FirstAidCertificateStatus;
        approvedAt?: Date | null;
        rejectedAt?: Date | null;
        rejectionReason?: string | null;
      }>,
    ) => {
      if (state.certificate) {
        state.certificate.firstAidCertificateStatus = action.payload.status;
        state.certificate.firstAidCertificateApprovedAt = action.payload.approvedAt || null;
        state.certificate.firstAidCertificateRejectedAt = action.payload.rejectedAt || null;
        state.certificate.firstAidCertificateRejectionReason =
          action.payload.rejectionReason || null;
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear certificate data
    clearCertificate: (state) => {
      state.certificate = null;
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = null;
    },

    // Reset upload state
    resetUpload: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = null;
    },
  },
});

export const {
  startUpload,
  updateUploadProgress,
  uploadSuccess,
  uploadFailed,
  loadCertificate,
  updateCertificateStatus,
  setLoading,
  setError,
  clearCertificate,
  resetUpload,
} = certificateSlice.actions;

export default certificateSlice.reducer;

// Selectors
export const selectCertificate = (state: { certificate: CertificateState }) =>
  state.certificate.certificate;
export const selectIsUploading = (state: { certificate: CertificateState }) =>
  state.certificate.isUploading;
export const selectUploadProgress = (state: { certificate: CertificateState }) =>
  state.certificate.uploadProgress;
export const selectCertificateLoading = (state: { certificate: CertificateState }) =>
  state.certificate.isLoading;
export const selectCertificateError = (state: { certificate: CertificateState }) =>
  state.certificate.error;
export const selectCertificateStatus = (state: { certificate: CertificateState }) =>
  state.certificate.certificate?.firstAidCertificateStatus;
export const selectCertificateUrl = (state: { certificate: CertificateState }) =>
  state.certificate.certificate?.firstAidCertificateUrl;
export const selectCertificateRejectionReason = (state: { certificate: CertificateState }) =>
  state.certificate.certificate?.firstAidCertificateRejectionReason;
