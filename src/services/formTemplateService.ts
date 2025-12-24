import { getCookie } from '@/lib/utils';
import type {
  CreateFormTemplateDto,
  FormTemplate,
  UpdateFormTemplateDto,
} from '@/types/formTemplate';
import { ApiResponse } from '@/types/types';

import api from './api';

// Create a separate axios instance for file uploads
const uploadApi = api;

/**
 * Admin: Get all form templates (visible and hidden)
 */
export const getAllFormTemplates = async (): Promise<ApiResponse<FormTemplate[]>> => {
  const response = await api.get('/form');
  return response.data;
};

/**
 * Admin: Get form template by ID
 */
export const getFormTemplateById = async (id: string): Promise<ApiResponse<FormTemplate>> => {
  const response = await api.get(`/form/${id}`);
  return response.data;
};

/**
 * Admin: Upload new form template
 */
export const uploadFormTemplate = async (
  data: CreateFormTemplateDto,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void,
): Promise<ApiResponse<FormTemplate>> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);

  const response = await uploadApi.post('/form', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  });
  return response.data;
};

/**
 * Admin: Update form template (title and/or visibility)
 */
export const updateFormTemplate = async (
  id: string,
  data: UpdateFormTemplateDto,
): Promise<ApiResponse<FormTemplate>> => {
  const response = await api.patch(`/form/${id}`, data);
  return response.data;
};

/**
 * Admin: Delete form template
 */
export const deleteFormTemplate = async (
  id: string,
): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  const response = await api.delete(`/form/${id}`);
  return response.data;
};

/**
 * Admin: Get signed URL for form template
 */
export const getAdminFormTemplateSignedUrl = async (
  id: string,
): Promise<FormTemplateSignedUrlResponse> => {
  const response = await api.get(`/form/${id}/signed-url`);
  return response.data.data || response.data;
};

/**
 * Admin: Download form template
 */
export const downloadFormTemplate = async (id: string): Promise<Blob> => {
  const token = getCookie('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await api.post(
      `/form/${id}/download`,
      { token },
      {
        responseType: 'blob',
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      },
    );

    // Check response status
    if (response.status >= 400) {
      // Try to parse error from blob
      if (response.data instanceof Blob && response.data.type === 'application/json') {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Failed to download file (${response.status})`);
        } catch {
          throw new Error(`Failed to download file (${response.status})`);
        }
      }
      throw new Error(`Failed to download file (${response.status})`);
    }

    // Check if the blob is actually an error response (JSON)
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'Failed to download file');
    }

    return response.data;
  } catch (error: unknown) {
    // If it's already an Error, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // If it's an axios error with a blob response, try to parse it
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: Blob; status?: number } };
      if (
        axiosError.response?.data instanceof Blob &&
        axiosError.response.data.type === 'application/json'
      ) {
        const text = await axiosError.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to download file');
        } catch {
          throw new Error('Failed to download file');
        }
      }
    }
    throw error;
  }
};

/**
 * Freelancer: Get visible form templates only
 */
export const getVisibleFormTemplates = async (): Promise<ApiResponse<FormTemplate[]>> => {
  const response = await api.get('/freelancer/forms');
  return response.data;
};

/**
 * Freelancer: Get signed URL for form template
 */
export interface FormTemplateSignedUrlResponse {
  signedUrl: string;
  expiresIn: number; // seconds
  fileName: string;
}

export const getFreelancerFormTemplateSignedUrl = async (
  id: string,
): Promise<FormTemplateSignedUrlResponse> => {
  const response = await api.get(`/freelancer/forms/${id}/signed-url`);
  return response.data.data || response.data;
};

/**
 * Freelancer: Download visible form template (legacy - use getFreelancerFormTemplateSignedUrl instead)
 * @deprecated Use getFreelancerFormTemplateSignedUrl instead
 */
export const downloadFreelancerFormTemplate = async (id: string): Promise<Blob> => {
  const token = getCookie('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await api.post(
      `/freelancer/forms/${id}/download`,
      { token },
      {
        responseType: 'blob',
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      },
    );

    // Check response status
    if (response.status >= 400) {
      // Try to parse error from blob
      if (response.data instanceof Blob && response.data.type === 'application/json') {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Failed to download file (${response.status})`);
        } catch {
          throw new Error(`Failed to download file (${response.status})`);
        }
      }
      throw new Error(`Failed to download file (${response.status})`);
    }

    // Check if the blob is actually an error response (JSON)
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'Failed to download file');
    }

    return response.data;
  } catch (error: unknown) {
    // If it's already an Error, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // If it's an axios error with a blob response, try to parse it
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: Blob; status?: number } };
      if (
        axiosError.response?.data instanceof Blob &&
        axiosError.response.data.type === 'application/json'
      ) {
        const text = await axiosError.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to download file');
        } catch {
          throw new Error('Failed to download file');
        }
      }
    }
    throw error;
  }
};

/**
 * Utility: Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Utility: Trigger browser download for PDF blob
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
