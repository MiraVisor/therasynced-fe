import { toast } from 'react-toastify';

import api from './api';

export interface GoogleSignInData {
  idToken: string;
}

export interface GoogleBackendResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      authProvider: string;
    };
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

/**
 * Send Google OAuth credential to backend for authentication
 */
export const authenticateWithGoogle = async (
  credential: string,
): Promise<GoogleBackendResponse> => {
  try {
    const response = await api.post('/auth/google-signin', {
      idToken: credential,
    });

    return response.data;
  } catch (error: any) {
    console.error('Google authentication error:', error);

    // Handle different error types
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Google authentication failed');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Google authentication failed');
    }
  }
};

/**
 * Handle complete Google sign-in flow
 */
export const handleGoogleSignInFlow = async (
  credential: string,
  onSuccess: (response: GoogleBackendResponse) => void,
  onError: (error: string) => void,
) => {
  try {
    toast.info('Authenticating with Google...');

    const response = await authenticateWithGoogle(credential);

    if (response.success && response.data.token) {
      toast.success(response.message || 'Google sign-in successful!');
      onSuccess(response);
    } else {
      const errorMessage = response.message || 'Google authentication failed';
      toast.error(errorMessage);
      onError(errorMessage);
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Google authentication failed';
    toast.error(errorMessage);
    onError(errorMessage);
  }
};
