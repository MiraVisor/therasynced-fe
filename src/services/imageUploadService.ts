import axios from 'axios';

import { getCookie } from '@/lib/utils';
import { CloudinaryUploadResponse } from '@/types/types';

import { ENDPOINTS } from './endpoints';

// Create a separate axios instance for file uploads
const uploadApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor to add auth token
uploadApi.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

// Default upload options
const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
};

// Validate file before upload
export const validateFile = (
  file: File,
  options: UploadOptions = {},
): { valid: boolean; error?: string } => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(config.maxSize / (1024 * 1024))}MB`,
    };
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${config.allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

// Get the correct field name based on the endpoint
const getFieldName = (endpoint: string): string => {
  if (endpoint.includes('/verification-document')) {
    return 'documents'; // Backend expects 'documents' (plural)
  } else if (endpoint.includes('/first-aid-certificate')) {
    return 'certificate';
  } else {
    return 'image'; // default for /single endpoint
  }
};

// Upload file to Cloudinary via backend
export const uploadToCloudinary = async (
  file: File,
  endpoint: string,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<CloudinaryUploadResponse> => {
  try {
    // Validate file first
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        url: '',
        publicId: '',
        success: false,
        error: validation.error,
      };
    }

    // Create FormData with correct field name
    const formData = new FormData();
    const fieldName = getFieldName(endpoint);
    formData.append(fieldName, file);

    // Upload to Cloudinary via backend
    const response = await uploadApi.post(endpoint, formData, {
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

    // Extract data from response
    const data = response.data?.data || response.data;

    return {
      url: data.url || data.secure_url,
      publicId: data.public_id,
      success: true,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      url: '',
      publicId: '',
      success: false,
      error: error.response?.data?.message || error.message || 'Upload failed',
    };
  }
};

// Delete file from Cloudinary via backend
export const deleteFromCloudinary = async (
  publicId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await uploadApi.delete(ENDPOINTS.image.deleteSingle(publicId));
    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Delete failed',
    };
  }
};

// Upload single image (general purpose)
export const uploadSingleImage = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<CloudinaryUploadResponse> => {
  return uploadToCloudinary(file, ENDPOINTS.image.uploadSingle, options, onProgress);
};

// Upload verification document
export const uploadVerificationDocument = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<CloudinaryUploadResponse> => {
  return uploadToCloudinary(file, ENDPOINTS.image.uploadVerificationDocument, options, onProgress);
};

// Upload first aid certificate
export const uploadFirstAidCertificate = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<CloudinaryUploadResponse> => {
  return uploadToCloudinary(file, ENDPOINTS.image.uploadFirstAidCertificate, options, onProgress);
};
