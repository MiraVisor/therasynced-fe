import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { registerUserTypes } from '@/types/types';

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post(ENDPOINTS.auth.login, data);
  return response.data;
};

export const signUpUserApi = async (data: registerUserTypes) => {
  const response = await api.post(ENDPOINTS.auth.signup, data);
  return response.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
  const response = await api.post(ENDPOINTS.auth.forgotPassword, data);
  return response.data;
};

export const resetPasswordApi = async (token: string, data: { newPassword: string }) => {
  const response = await api.post(ENDPOINTS.auth.resetPassword(token), data);
  return response.data;
};

export const verifyEmailLinkApi = async (data: { token: string }) => {
  const response = await api.post(ENDPOINTS.auth.verifyEmailLink, data);
  return response.data;
};

export const googleSignInApi = async (idToken: string) => {
  const response = await api.post(ENDPOINTS.auth.googleSignIn, { idToken });
  return response.data;
};

export const sendVerificationEmailApi = async (data: { email: string }) => {
  const response = await api.post(ENDPOINTS.auth.sendVerificationEmail, data);
  return response.data;
};
