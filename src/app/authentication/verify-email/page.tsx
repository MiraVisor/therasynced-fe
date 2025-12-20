'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useVerifyEmail } from '@/hooks/queries/useAuth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();

  useEffect(() => {
    // Get search params only on client side
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenParam = searchParams.get('token');
      setToken(tokenParam);

      if (tokenParam) {
        verifyEmail(tokenParam, {
          onSuccess: () => {
            setIsVerified(true);
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          },
          onError: (err: any) => {
            setError(err?.message || 'Failed to verify email. Please try again.');
          },
        });
      } else {
        setError('Invalid verification link. Please check your email for the correct link.');
      }
    }
  }, [verifyEmail, router]);

  const handleBackToSignIn = () => {
    router.push('/authentication/sign-in');
  };

  const renderCard = (content: React.ReactNode) => (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden">
      {/* Modern Background with Gradient and Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgb(0,119,69)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/80 backdrop-blur-sm overflow-hidden">
          {/* Card Header with subtle gradient */}
          <div className="bg-gradient-to-b from-white to-gray-50/50 px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex justify-center mb-4">
              <img
                className="h-16 w-auto mx-auto drop-shadow-sm"
                src="/svgs/therasynced_logo.svg"
                alt="Therasynced"
              />
            </div>
          </div>

          {/* Card Content */}
          <div className="px-8 py-8 bg-white">{content}</div>
        </div>
      </div>
    </div>
  );

  if (isVerifying) {
    return renderCard(
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-poppins font-bold text-charcoal">Verifying Your Email</h3>
          <p className="text-sm font-inter text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>,
    );
  }

  if (isVerified) {
    return renderCard(
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-poppins font-bold text-charcoal">
            Email Verified Successfully!
          </h3>
          <p className="text-sm font-inter text-gray-600">
            Your email has been verified. You will be redirected to the dashboard shortly.
          </p>
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full h-12 font-inter font-semibold rounded-xl transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
        >
          Go to Dashboard
        </Button>
      </div>,
    );
  }

  if (error) {
    return renderCard(
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-poppins font-bold text-charcoal">Verification Failed</h3>
          <p className="text-sm font-inter text-gray-600">{error}</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => token && verifyEmail(token)}
            disabled={!token}
            className="w-full h-12 font-inter font-semibold rounded-xl transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
          >
            Try Again
          </Button>

          <Button
            onClick={handleBackToSignIn}
            variant="outline"
            className="w-full h-12 font-inter font-semibold rounded-xl transition-all duration-200 text-sm"
          >
            Back to Sign In
          </Button>
        </div>
      </div>,
    );
  }

  return renderCard(
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Loading...</h3>
        <p className="text-sm font-inter text-gray-600">
          Please wait while we load the verification page...
        </p>
      </div>
    </div>,
  );
}
