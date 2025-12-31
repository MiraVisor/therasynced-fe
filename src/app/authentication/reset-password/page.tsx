'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import ResetPasswordForm from '@/components/core/authentication/ResetPasswordForm';

function ResetPasswordContent() {
  const handleBackToSignIn = () => {
    window.location.href = '/authentication/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden">
      {/* Modern Background with Gradient and Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgb(0,119,69)_1px,transparent_0)] bg-[length:40px_40px]" />
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/80 backdrop-blur-sm overflow-hidden">
          {/* Card Header with subtle gradient */}
          <div className="bg-gradient-to-b from-white to-gray-50/50 px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex justify-center mb-4">
              <Link href="/" className="inline-block">
                <img
                  className="h-16 w-auto mx-auto drop-shadow-sm"
                  src="/svgs/therasynced_logo.svg"
                  alt="Therasynced"
                />
              </Link>
            </div>
          </div>

          {/* Card Content */}
          <div className="px-8 py-8 bg-white">
            <Suspense
              fallback={
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-poppins font-bold text-charcoal">Loading...</h2>
                    <p className="text-sm font-inter text-gray-600">
                      Please wait while we load the reset form.
                    </p>
                  </div>
                </div>
              }
            >
              <ResetPasswordForm onBackToSignIn={handleBackToSignIn} />
            </Suspense>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs font-inter text-gray-500">
            &copy; 2024 Therasynced. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
