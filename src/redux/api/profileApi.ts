import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import {
  BackendProfileResponse,
  ChangeEmailDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '@/types/types';

export const getProfile = async (): Promise<BackendProfileResponse> => {
  const response = await api.get(ENDPOINTS.profile.get);
  return response.data;
};

export const updateProfile = async (data: UpdateProfileDto) => {
  const response = await api.patch(ENDPOINTS.profile.update, data);
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
