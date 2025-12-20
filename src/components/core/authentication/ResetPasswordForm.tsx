'use client';

import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { resetPasswordApi } from '@/services/authService';

interface ResetPasswordFormProps {
  onBackToSignIn: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToSignIn }) => {
  const [token, setToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get search params only on client side
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);
  }, []);

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPasswordApi(token, { newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Invalid Reset Link</h2>
          <p className="text-sm font-inter text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="text-sm font-inter font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-poppins font-semibold text-charcoal">
              Password Reset Successful!
            </h3>
            <p className="text-sm font-inter text-gray-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>
        </div>

        <Button
          onClick={onBackToSignIn}
          className="w-full h-12 font-inter font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-charcoal">Reset Your Password</h2>
        <p className="text-sm font-inter text-gray-600">Enter your new password below</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-inter font-medium text-gray-700 flex items-center gap-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-base font-inter shadow-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-inter font-medium text-gray-700 flex items-center gap-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-base font-inter shadow-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-inter flex items-center gap-1" role="alert">
            <span className="w-1 h-1 bg-red-500 rounded-full" />
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full h-12 font-inter font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            disabled={loading}
            className="text-sm font-inter font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
