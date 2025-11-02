'use client';

import { ArrowLeft, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { forgotPasswordApi } from '@/redux/api/authApi';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle sending password reset email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPasswordApi({ email });
      setEmailSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-charcoal">
          {!emailSent ? 'Reset Password' : 'Check Your Email'}
        </h2>
        <p className="text-sm font-inter text-gray-600">
          {!emailSent
            ? 'Enter your email address to receive a password reset link'
            : "We've sent a password reset link to your email address"}
        </p>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-inter font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-sm font-inter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs font-inter mt-0.5">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full h-10 font-inter font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToSignIn}
              disabled={loading}
              className="text-xs font-inter font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-poppins font-semibold text-charcoal">Email Sent!</h3>
              <p className="text-sm font-inter text-gray-600">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs font-inter text-gray-500">
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              className="w-full h-10 font-inter font-semibold rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
            >
              Send to Different Email
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToSignIn}
                className="text-xs font-inter font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
