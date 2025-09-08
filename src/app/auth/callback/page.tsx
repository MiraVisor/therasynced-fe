'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { setCookie } from '@/lib/utils';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';

export default function AuthCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const returnUrl = searchParams.get('returnUrl');

        if (error) {
          toast.error(decodeURIComponent(error));
          router.push('/authentication/sign-in');
          return;
        }

        if (success === 'true' && token) {
          // Store the token in cookies (same as normal login)
          if (typeof window !== 'undefined') {
            setCookie('token', token);
          }

          // Update Redux state exactly like normal login
          dispatch({
            type: 'auth/googleSignIn/fulfilled',
            payload: {
              data: {
                data: {
                  token,
                  user: {
                    role: 'PATIENT', // Default role, will be updated by API interceptor
                  },
                },
              },
            },
          });

          toast.success('Successfully signed in with Google!');

          // Redirect to the intended page or dashboard
          const finalUrl = returnUrl || '/dashboard';
          router.push(finalUrl);
        } else {
          toast.error('Authentication failed');
          router.push('/authentication/sign-in');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        router.push('/authentication/sign-in');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, dispatch]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
