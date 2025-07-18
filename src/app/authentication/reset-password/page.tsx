'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import ResetPasswordForm from '@/components/core/authentication/ResetPasswordForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
  const handleBackToSignIn = () => {
    window.location.href = '/authentication/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <img
              className="h-12 w-auto mx-auto"
              src="/svgs/therasynced_logo.svg"
              alt="Therasynced"
            />
          </Link>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <Suspense
            fallback={
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
                  <p className="text-sm text-gray-600">Please wait while we load the reset form.</p>
                </div>
              </div>
            }
          >
            <ResetPasswordForm onBackToSignIn={handleBackToSignIn} />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">&copy; 2024 Therasynced. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
