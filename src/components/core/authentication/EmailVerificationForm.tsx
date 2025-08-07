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
        <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-sm text-gray-600">
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-gray-900">{email || 'your email'}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>You&apos;ll be automatically redirected to the dashboard</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-gray-600">
              Didn&apos;t receive the email?{' '}
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </button>
            </p>

            <button
              type="button"
              onClick={onBack}
              disabled={isResending}
              className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
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
