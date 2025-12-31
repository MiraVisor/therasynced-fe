import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import * as authApi from '@/services/authService';
import { updateMultipleConsents } from '@/services/consentService';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/types/common';
import type { ConsentUpdateRequest } from '@/types/consent';
import { registerUserTypes, RoleType } from '@/types/types';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => authApi.loginApi(credentials),
    onSuccess: (response) => {
      const { token } = response.data.data;
      const role = response.data.data.user.role as RoleType;

      login(token, role);
      router.push('/dashboard?login=success');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Login failed. Please check your credentials.');
    },
  });
};

/**
 * Hook for user signup
 */
export const useSignUp = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: registerUserTypes) => authApi.signUpUserApi(credentials),
    onSuccess: async (response, variables) => {
      // If signup returns a token immediately, login the user
      if (response.data?.data?.token) {
        const { token } = response.data.data;
        const role = response.data.data.user.role as RoleType;
        login(token, role);

        // Save consents to backend after successful signup
        if (variables.termsConsent || variables.privacyConsent || variables.gdprConsent) {
          try {
            const consentUpdates: ConsentUpdateRequest[] = [];

            if (variables.termsConsent) {
              consentUpdates.push({ consentType: 'TERMS_OF_SERVICE', granted: true });
            }
            if (variables.privacyConsent) {
              consentUpdates.push({ consentType: 'PRIVACY_POLICY', granted: true });
            }
            if (variables.gdprConsent) {
              consentUpdates.push({ consentType: 'GDPR_DATA_PROCESSING', granted: true });
            }

            if (consentUpdates.length > 0) {
              await updateMultipleConsents(consentUpdates);
            }
          } catch (error) {
            // Log error but don't block signup flow
            console.error('Failed to save consents after signup:', error);
          }
        }

        router.push(
          `/dashboard?login=success&message=${encodeURIComponent('Account created successfully!')}`,
        );
      } else {
        toast.success('Account created! Please verify your email.');
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Signup failed. Please try again.');
    },
  });
};

/**
 * Hook for Google sign in
 */
export const useGoogleSignIn = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (idToken: string) => authApi.googleSignInApi(idToken),
    onSuccess: (response) => {
      const { token } = response.data.data;
      const role = response.data.data.user.role as RoleType;

      login(token, role);
      router.push('/dashboard?login=success');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Google sign-in failed.');
    },
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmail = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmailLinkApi({ token }),
    onSuccess: (response) => {
      if (response.data?.data?.token) {
        const { token } = response.data.data;
        const role = response.data.data.user.role as RoleType;
        login(token, role);
        router.push(
          `/dashboard?login=email&message=${encodeURIComponent('Email verified successfully!')}`,
        );
      } else {
        toast.success('Email verified successfully!');
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Email verification failed.');
    },
  });
};

/**
 * Hook for forgot password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPasswordApi(data),
    onSuccess: () => {
      toast.success('Password reset email sent! Please check your inbox.');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to send password reset email.');
    },
  });
};

/**
 * Hook for reset password
 */
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPasswordApi(token, { newPassword }),
    onSuccess: () => {
      router.push('/authentication/sign-in?reset=success');
      // Show toast after navigation
      setTimeout(() => {
        toast.success('Password reset successful!');
      }, 100);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Password reset failed.');
    },
  });
};

/**
 * Hook for resending verification email
 */
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.sendVerificationEmailApi(data),
    onSuccess: () => {
      toast.success('Verification email resent to your inbox');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to resend verification email');
    },
  });
};

// Alias for backward compatibility
export const useSignup = useSignUp;
