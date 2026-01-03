import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { registerUserTypes } from '@/types/types';

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post(ENDPOINTS.auth.login, data);
  return response.data;
};

export const signUpUserApi = async (data: registerUserTypes) => {
  // Debug: Log signup data (without sensitive info)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Signup API] Sending signup request:', {
      name: data.name,
      email: data.email,
      role: data.role,
      hasPassword: !!data.password,
      hasOAuthToken: !!data.oauthSignupToken,
      oauthSignupTokenLength: data.oauthSignupToken?.length || 0,
    });

    // Validate OAuth signup
    if (!data.password && !data.oauthSignupToken) {
      console.error('[Signup API] ERROR: OAuth signup missing oauthSignupToken!');
    }
  }

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
  // Use GET endpoint with query parameter (recommended)
  const response = await api.get(
    `${ENDPOINTS.auth.verifyEmail}?token=${encodeURIComponent(data.token)}`,
  );
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
