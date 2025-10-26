import { createSlice } from '@reduxjs/toolkit';

import { FileUploadResponse } from '@/types/types';

import * as imageUploadApi from '../api/imageUploadApi';

interface ImageUploadState {
  uploadedFile: FileUploadResponse['data'] | null;
  uploadProgress: number;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: ImageUploadState = {
  uploadedFile: null,
  uploadProgress: 0,
  isUploading: false,
  isDeleting: false,
  error: null,
};

const imageUploadSlice = createSlice({
  name: 'imageUpload',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUploadedFile: (state) => {
      state.uploadedFile = null;
      state.uploadProgress = 0;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload single image
    builder
      .addCase(imageUploadApi.uploadSingleImage.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(imageUploadApi.uploadSingleImage.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.uploadedFile = action.payload.data;
      })
      .addCase(imageUploadApi.uploadSingleImage.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Upload verification document
    builder
      .addCase(imageUploadApi.uploadVerificationDocument.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(imageUploadApi.uploadVerificationDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.uploadedFile = action.payload.data;
      })
      .addCase(imageUploadApi.uploadVerificationDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Upload first-aid certificate
    builder
      .addCase(imageUploadApi.uploadFirstAidCertificate.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(imageUploadApi.uploadFirstAidCertificate.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.uploadedFile = action.payload.data;
      })
      .addCase(imageUploadApi.uploadFirstAidCertificate.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Delete image
    builder
      .addCase(imageUploadApi.deleteImage.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(imageUploadApi.deleteImage.fulfilled, (state) => {
        state.isDeleting = false;
        state.uploadedFile = null;
      })
      .addCase(imageUploadApi.deleteImage.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearUploadedFile, setUploadProgress } = imageUploadSlice.actions;
export default imageUploadSlice.reducer;
