import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { FreelancerFile } from '@/types/types';

import { getFreelancerFiles, getVerificationStatus } from '../api/verificationApi';

interface VerificationDocument {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  publicId?: string;
}

interface VerificationState {
  documents: VerificationDocument[];
  allFiles: FreelancerFile[];
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  verificationRequestedAt: Date | null;
  verificationApprovedAt: Date | null;
  verificationRejectedAt: Date | null;
  verificationRejectionReason: string | null;
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  isLoading: boolean;
  backgroundRefreshing: boolean;
  initialLoading: boolean;
  isLoadingFiles: boolean;
  backgroundRefreshingFiles: boolean;
  initialLoadingFiles: boolean;
  error: string | null;
  filesError: string | null;
}

const initialState: VerificationState = {
  documents: [],
  allFiles: [],
  verificationStatus: 'NOT_SUBMITTED',
  verificationRequestedAt: null,
  verificationApprovedAt: null,
  verificationRejectedAt: null,
  verificationRejectionReason: null,
  isUploading: false,
  uploadProgress: {},
  isLoading: false,
  backgroundRefreshing: false,
  initialLoading: false,
  isLoadingFiles: false,
  backgroundRefreshingFiles: false,
  initialLoadingFiles: false,
  error: null,
  filesError: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    // Start document upload
    startUpload: (state, action: PayloadAction<string>) => {
      const documentId = action.payload;
      state.isUploading = true;
      state.uploadProgress[documentId] = 0;
      state.error = null;
    },

    // Update upload progress for specific document
    updateUploadProgress: (
      state,
      action: PayloadAction<{
        documentId: string;
        progress: number;
      }>,
    ) => {
      const { documentId, progress } = action.payload;
      state.uploadProgress[documentId] = progress;
    },

    // Upload successful
    uploadSuccess: (state, action: PayloadAction<VerificationDocument>) => {
      const document = action.payload;
      state.documents.push(document);
      state.isUploading = false;
      state.uploadProgress[document.id] = 100;
      state.error = null;
    },

    // Upload failed
    uploadFailed: (
      state,
      action: PayloadAction<{
        documentId: string;
        error: string;
      }>,
    ) => {
      const { documentId, error } = action.payload;
      state.isUploading = false;
      state.uploadProgress[documentId] = 0;
      state.error = error;
    },

    // Remove document
    removeDocument: (state, action: PayloadAction<string>) => {
      const documentId = action.payload;
      state.documents = state.documents.filter((doc) => doc.id !== documentId);
      delete state.uploadProgress[documentId];
    },

    // Load verification data
    loadVerificationData: (
      state,
      action: PayloadAction<{
        documents: VerificationDocument[];
        verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
        verificationRequestedAt?: Date | null;
        verificationApprovedAt?: Date | null;
        verificationRejectedAt?: Date | null;
        verificationRejectionReason?: string | null;
      }>,
    ) => {
      const {
        documents,
        verificationStatus,
        verificationRequestedAt,
        verificationApprovedAt,
        verificationRejectedAt,
        verificationRejectionReason,
      } = action.payload;

      state.documents = documents;
      state.verificationStatus = verificationStatus;
      state.verificationRequestedAt = verificationRequestedAt || null;
      state.verificationApprovedAt = verificationApprovedAt || null;
      state.verificationRejectedAt = verificationRejectedAt || null;
      state.verificationRejectionReason = verificationRejectionReason || null;
      state.isLoading = false;
      state.error = null;
    },

    // Update verification status
    updateVerificationStatus: (
      state,
      action: PayloadAction<{
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        approvedAt?: Date | null;
        rejectedAt?: Date | null;
        rejectionReason?: string | null;
      }>,
    ) => {
      const { status, approvedAt, rejectedAt, rejectionReason } = action.payload;
      state.verificationStatus = status;
      state.verificationApprovedAt = approvedAt || null;
      state.verificationRejectedAt = rejectedAt || null;
      state.verificationRejectionReason = rejectionReason || null;
    },

    // Request verification
    requestVerification: (state) => {
      state.verificationStatus = 'PENDING';
      state.verificationRequestedAt = new Date();
      state.verificationApprovedAt = null;
      state.verificationRejectedAt = null;
      state.verificationRejectionReason = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set files loading state
    setFilesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingFiles = action.payload;
    },

    // Set files error
    setFilesError: (state, action: PayloadAction<string | null>) => {
      state.filesError = action.payload;
    },

    // Load all files
    loadAllFiles: (state, action: PayloadAction<FreelancerFile[]>) => {
      state.allFiles = action.payload;
      state.isLoadingFiles = false;
      state.filesError = null;
    },

    // Remove file from all files
    removeFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      state.allFiles = state.allFiles.filter((file) => file.id !== fileId);
    },

    // Clear verification data
    clearVerification: (state) => {
      state.documents = [];
      state.allFiles = [];
      state.verificationStatus = 'NOT_SUBMITTED';
      state.verificationRequestedAt = null;
      state.verificationApprovedAt = null;
      state.verificationRejectedAt = null;
      state.verificationRejectionReason = null;
      state.isUploading = false;
      state.uploadProgress = {};
      state.isLoadingFiles = false;
      state.error = null;
      state.filesError = null;
    },

    // Reset upload state
    resetUpload: (state) => {
      state.isUploading = false;
      state.uploadProgress = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle getVerificationStatus
    builder
      .addCase(getVerificationStatus.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        const hasData = state.verificationStatus !== 'NOT_SUBMITTED' || state.documents.length > 0;
        if (silent && hasData) {
          state.backgroundRefreshing = true;
        } else {
          state.isLoading = true;
          if (!hasData) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(getVerificationStatus.fulfilled, (state, action: any) => {
        const payload = action.payload.data || action.payload;
        state.verificationStatus = payload.verificationStatus;
        state.documents = payload.verificationDocuments || [];
        state.verificationRequestedAt = payload.verificationRequestedAt;
        state.verificationApprovedAt = payload.verificationApprovedAt;
        state.verificationRejectedAt = payload.verificationRejectedAt;
        state.verificationRejectionReason = payload.verificationRejectionReason;
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = null;
      })
      .addCase(getVerificationStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      });

    // Handle getFreelancerFiles
    builder
      .addCase(getFreelancerFiles.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.allFiles.length > 0) {
          state.backgroundRefreshingFiles = true;
        } else {
          state.isLoadingFiles = true;
          if (state.allFiles.length === 0) {
            state.initialLoadingFiles = true;
          }
        }
        state.filesError = null;
      })
      .addCase(getFreelancerFiles.fulfilled, (state, action: any) => {
        const payload = action.payload.data || action.payload;
        state.allFiles = payload;
        state.isLoadingFiles = false;
        state.backgroundRefreshingFiles = false;
        state.initialLoadingFiles = false;
        state.filesError = null;
      })
      .addCase(getFreelancerFiles.rejected, (state, action: any) => {
        state.isLoadingFiles = false;
        state.backgroundRefreshingFiles = false;
        state.initialLoadingFiles = false;
        state.filesError = action.payload as string;
      });
  },
});

export const {
  startUpload,
  updateUploadProgress,
  uploadSuccess,
  uploadFailed,
  removeDocument,
  loadVerificationData,
  updateVerificationStatus,
  requestVerification,
  setLoading,
  setError,
  setFilesLoading,
  setFilesError,
  loadAllFiles,
  removeFile,
  clearVerification,
  resetUpload,
} = verificationSlice.actions;

export default verificationSlice.reducer;

// Selectors
export const selectVerificationDocuments = (state: { verification: VerificationState }) =>
  state.verification.documents;
export const selectAllFiles = (state: { verification: VerificationState }) =>
  state.verification.allFiles;
export const selectVerificationStatus = (state: { verification: VerificationState }) =>
  state.verification.verificationStatus;
export const selectVerificationRequestedAt = (state: { verification: VerificationState }) =>
  state.verification.verificationRequestedAt;
export const selectVerificationApprovedAt = (state: { verification: VerificationState }) =>
  state.verification.verificationApprovedAt;
export const selectVerificationRejectedAt = (state: { verification: VerificationState }) =>
  state.verification.verificationRejectedAt;
export const selectVerificationRejectionReason = (state: { verification: VerificationState }) =>
  state.verification.verificationRejectionReason;
export const selectIsUploading = (state: { verification: VerificationState }) =>
  state.verification.isUploading;
export const selectUploadProgress = (state: { verification: VerificationState }) =>
  state.verification.uploadProgress;
export const selectVerificationLoading = (state: { verification: VerificationState }) =>
  state.verification.isLoading;
export const selectVerificationError = (state: { verification: VerificationState }) =>
  state.verification.error;
export const selectFilesLoading = (state: { verification: VerificationState }) =>
  state.verification.isLoadingFiles;
export const selectFilesError = (state: { verification: VerificationState }) =>
  state.verification.filesError;
export const selectDocumentCount = (state: { verification: VerificationState }) =>
  state.verification.documents.length;
export const selectFileCount = (state: { verification: VerificationState }) =>
  state.verification.allFiles.length;
export const selectIsVerificationPending = (state: { verification: VerificationState }) =>
  state.verification.verificationStatus === 'PENDING';
export const selectIsVerificationApproved = (state: { verification: VerificationState }) =>
  state.verification.verificationStatus === 'APPROVED';
export const selectIsVerificationRejected = (state: { verification: VerificationState }) =>
  state.verification.verificationStatus === 'REJECTED';
