'use client';

import { Chrome, Eye, EyeOff, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { cn } from '@/lib/utils';
import { BACKEND_URL } from '@/services/endpoints';
import { useSignupUIStore } from '@/stores/signupUIStore';

import { SignupFormData } from '../MultiStepSignup';

export function AccountSetupStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const {
    authMethod,
    showPassword,
    showConfirmPassword,
    isGoogleLoading,
    setAuthMethod,
    setShowPassword,
    setShowConfirmPassword,
    setIsGoogleLoading,
  } = useSignupUIStore();

  // Reset loading state when component mounts (in case user navigated back)
  useEffect(() => {
    setIsGoogleLoading(false);
  }, [setIsGoogleLoading]);

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      // Use callback URL to ensure proper flow handling
      const callbackUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';

      // Ensure BACKEND_URL doesn't have trailing slash and construct URL properly
      const backendUrl = (BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

      // Construct Google OAuth URL with signup=true parameter
      // IMPORTANT: signup=true must be included for signup flow
      const googleAuthUrl = `${backendUrl}/auth/google?returnUrl=${encodeURIComponent(callbackUrl)}&signup=true`;

      // Debug: Log the URL to verify signup parameter is included
      if (process.env.NODE_ENV === 'development') {
        console.log('[Google Signup] Redirecting to:', googleAuthUrl);
        console.log('[Google Signup] signup parameter:', googleAuthUrl.includes('signup=true'));
      }

      window.location.href = googleAuthUrl;
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error('Failed to initiate Google sign-up');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="text-center space-y-1 mb-4">
        <h3 className="text-xl font-poppins font-bold text-charcoal">
          {authMethod === 'email'
            ? 'Create Your Account'
            : authMethod === 'oauth'
              ? 'Account Details'
              : 'Choose Signup Method'}
        </h3>
        <p className="text-xs font-inter text-gray-600">
          {authMethod === 'email'
            ? 'Enter your name, email, and create a password'
            : authMethod === 'oauth'
              ? 'Review your account information from Google'
              : 'Continue with Google or use email'}
        </p>
      </div>

      {/* OAuth Option */}
      {!authMethod && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className={cn(
              'w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-all duration-200 text-sm font-inter font-medium',
              'border-gray-300 hover:bg-gray-50',
              isGoogleLoading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isGoogleLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span>Signing up...</span>
              </div>
            ) : (
              <>
                <Chrome className="h-4 w-4" />
                Continue with Google
              </>
            )}
          </button>

          <div className="relative py-1">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-2 text-xs text-gray-500 font-inter">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={cn(
              'w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-all duration-200 text-sm font-inter font-medium',
              authMethod === 'email'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-300 hover:bg-gray-50',
            )}
          >
            <Mail className="h-4 w-4" />
            Continue with Email
          </button>
        </div>
      )}

      {/* Email Entry Form */}
      {authMethod === 'email' && (
        <div className="space-y-2">
          {/* Name Field */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-inter font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text">
              {...register('name')}
              id="name"
              aria-label="Full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={cn(
                'w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-primary',
              )}
              placeholder="Enter your full name">
              autoFocus
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-inter font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email">
              {...register('email')}
              id="email"
              aria-label="Email address"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(
                'w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-primary',
              )}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-inter font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={cn(
                  'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                  errors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-primary',
                )}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-inter mt-0.5">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-inter font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={cn(
                  'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-primary',
                )}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs font-inter mt-0.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* OAuth Pre-filled Info */}
      {authMethod === 'oauth' && (
        <div className="space-y-2">
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 mb-4">
            <p className="text-xs font-inter text-gray-600">
              We&apos;ve pre-filled your information from Google. Please review and continue.
            </p>
            <div className="space-y-1 mt-2">
              {watch('name') && (
                <p className="text-sm font-inter font-medium text-charcoal">
                  Name: {watch('name')}
                </p>
              )}
              {watch('email') && (
                <p className="text-sm font-inter font-medium text-charcoal">
                  Email: {watch('email')}
                </p>
              )}
            </div>
          </div>

          {/* OAuth Read-only Display */}
          <div className="space-y-2">
            {/* Name Field - Read-only display */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-inter font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={watch('name') || ''}
                readOnly
                className="w-full h-10 px-3 border rounded-lg bg-gray-50 text-sm font-inter text-gray-600 cursor-not-allowed border-gray-300"
              />
            </div>

            {/* Email Field - Read-only display */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-inter font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={watch('email') || ''}
                readOnly
                className="w-full h-10 px-3 border rounded-lg bg-gray-50 text-sm font-inter text-gray-600 cursor-not-allowed border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
