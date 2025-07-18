'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { verifyEmailLinkUser } from '@/redux/slices';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setIsVerifying(true);
    setError('');

    try {
      await dispatch(verifyEmailLinkUser(token)).unwrap();
      setIsVerified(true);
      toast.success('Email verified successfully!');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to verify email. Please try again.');
      toast.error(err?.message || 'Email verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/authentication/sign-in');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Verifying Your Email</h3>
              <p className="text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Email Verified Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your email has been verified. You will be redirected to the dashboard shortly.
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full h-12 font-semibold rounded-xl transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Verification Failed</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={verifyEmail}
              disabled={!token}
              className="w-full h-12 font-semibold rounded-xl transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
            >
              Try Again
            </Button>

            <Button
              onClick={handleBackToSignIn}
              variant="outline"
              className="w-full h-12 font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
