import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { registerUserTypes } from '@/types/types';

export const loginApi = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post(ENDPOINTS.auth.login, data);
    return response.data;
  } catch (error: any) {
    // If the error has a response, throw it with the server's message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    // If there's no response or message, throw a generic error
    throw new Error(error.message || 'Failed to login. Please try again.');
  }
};

export const signUpUserApi = async (data: registerUserTypes) => {
  try {
    const response = await api.post(ENDPOINTS.auth.signup, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to sign up. Please try again.');
  }
};
