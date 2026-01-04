import axios from 'axios';

import { getCookie } from '@/lib/utils';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  BackendProfileResponse,
  ChangeEmailDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '@/types/types';

// Create a separate axios instance for file uploads
const uploadApi = axios.create({
  baseURL: process.env['NEXT_PUBLIC_BACKEND_URL'],
  headers: {
    'Content-Type': 'multipart/form-data',
    'ngrok-skip-browser-warning': 'true',
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

export interface UploadProfilePictureResponse {
  success: boolean;
  message: string;
  data: {
    profilePicture: string;
  };
  meta: {
    code: number;
    status: string;
  };
}

export const getProfile = async (): Promise<BackendProfileResponse> => {
  const response = await api.get(ENDPOINTS.profile.get);
  return response.data;
};

export const updateProfile = async (data: UpdateProfileDto) => {
  const response = await api.patch(ENDPOINTS.profile.update, data);
  return response.data;
};

/**
 * Upload profile picture
 * @param file - Image file (JPEG, JPG, PNG, WEBP, max 2MB)
 * @returns Response with the new profile picture URL (pre-signed, expires in 1 hour)
 */
export const uploadProfilePicture = async (file: File): Promise<UploadProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await uploadApi.post<UploadProfilePictureResponse>(
    ENDPOINTS.profile.uploadPicture,
    formData,
  );
  return response.data;
};

export interface ProfilePictureSignedUrlResponse {
  success: boolean;
  data: {
    signedUrl: string;
  };
  meta: {
    code: number;
    status: string;
  };
}

/**
 * Get a fresh signed URL for the profile picture
 * @returns Response with a new signed URL (valid for 1 hour)
 */
export const getProfilePictureSignedUrl = async (): Promise<ProfilePictureSignedUrlResponse> => {
  const response = await api.get<ProfilePictureSignedUrlResponse>(
    ENDPOINTS.profile.getPictureSignedUrl,
  );
  return response.data;
};

export const changePassword = async (data: ChangePasswordDto) => {
  const response = await api.patch(ENDPOINTS.profile.changePassword, data);
  return response.data;
};

export const changeEmail = async (data: ChangeEmailDto) => {
  const response = await api.patch(ENDPOINTS.profile.changeEmail, data);
  return response.data;
};

export const deleteProfile = async () => {
  const response = await api.delete(ENDPOINTS.profile.delete);
  return response.data;
};
