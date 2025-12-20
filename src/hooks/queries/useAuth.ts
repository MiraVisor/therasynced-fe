import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import * as authApi from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { RoleType, registerUserTypes } from '@/types/types';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => authApi.loginApi(credentials),
    onSuccess: (response) => {
      const token = response.data.data.token;
      const role = response.data.data.user.role as RoleType;

      login(token, role);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Login failed. Please check your credentials.');
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
    onSuccess: (response) => {
      // If signup returns a token immediately, login the user
      if (response.data?.data?.token) {
        const token = response.data.data.token;
        const role = response.data.data.user.role as RoleType;
        login(token, role);
        router.push('/dashboard');
      } else {
        toast.success('Account created! Please verify your email.');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Signup failed. Please try again.');
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
      const token = response.data.data.token;
      const role = response.data.data.user.role as RoleType;

      login(token, role);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Google sign-in failed.');
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
        const token = response.data.data.token;
        const role = response.data.data.user.role as RoleType;
        login(token, role);
        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        toast.success('Email verified successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Email verification failed.');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send password reset email.');
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
      toast.success('Password reset successful!');
      router.push('/authentication/sign-in');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Password reset failed.');
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
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resend verification email');
    },
  });
};

// Alias for backward compatibility
export const useSignup = useSignUp;
