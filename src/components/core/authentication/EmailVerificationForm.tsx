'use client';

import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';

interface EmailVerificationFormProps {
  onBack: () => void;
  email?: string;
  onResendEmail?: () => void;
}

export default function EmailVerificationForm({
  onBack,
  email,
  onResendEmail,
}: EmailVerificationFormProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (onResendEmail) {
      setIsResending(true);
      try {
        await onResendEmail();
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-poppins font-bold text-charcoal">Check Your Email</h2>
        <p className="text-sm font-inter text-gray-600">
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-charcoal">{email || 'your email'}</span>
        </p>
        <p className="text-xs font-inter text-gray-500 mt-2">
          Click the link in your email to verify your account. You can close this tab after clicking
          the link.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-inter text-blue-800">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs font-inter">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>You&apos;ll be automatically logged in and redirected to the dashboard</li>
                  <li>You can close this tab after clicking the verification link</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs font-inter text-gray-600">
              Didn&apos;t receive the email?{' '}
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </button>
            </p>

            <button
              type="button"
              onClick={onBack}
              disabled={isResending}
              className="text-sm font-inter font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
