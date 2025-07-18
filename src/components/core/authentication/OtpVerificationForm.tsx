'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface OtpVerificationFormProps {
  onBack: () => void;
  onVerify: (otp: string) => void;
  email?: string;
  isLoading?: boolean;
  resendOtp?: () => void;
}

export default function OtpVerificationForm({
  onBack,
  onVerify,
  email,
  isLoading = false,
  resendOtp,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    onVerify(otp);
  };

  const handleResendOtp = () => {
    if (resendOtp) {
      resendOtp();
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-sm text-gray-600">
          We&apos;ve sent a 6-digit verification code to{' '}
          <span className="font-medium text-gray-900">{email || 'your email'}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Verification Code</label>
            <input
              type="text"
              className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-base text-center tracking-widest font-mono"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              placeholder="Enter 6-digit code"
              required
              disabled={isLoading}
              maxLength={6}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length < 6}
            isLoading={isLoading}
            className="w-full h-10 font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm shadow-sm"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        <div className="text-center space-y-3 mt-6">
          <p className="text-xs text-gray-600">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
            >
              Resend Code
            </button>
          </p>

          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
