'use client';

import Link from 'next/link';

import ResetPasswordForm from '@/components/core/authentication/ResetPasswordForm';

export default function ResetPasswordPage() {
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
          <ResetPasswordForm onBackToSignIn={handleBackToSignIn} />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">&copy; 2024 Therasynced. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
