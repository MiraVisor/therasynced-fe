'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve the token query parameter when redirecting
    const token = searchParams.get('token');
    if (token) {
      router.replace(`/authentication/reset-password?token=${encodeURIComponent(token)}`);
    } else {
      router.replace('/authentication/reset-password');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
