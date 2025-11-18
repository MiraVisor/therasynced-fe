'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { setCookie } from '@/lib/utils';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';

function AuthCallbackContent() {
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
        const isSignup = searchParams.get('signup') === 'true';
        const userData = searchParams.get('userData'); // OAuth user data if available

        if (error) {
          toast.error(decodeURIComponent(error));
          router.push(isSignup ? '/authentication/sign-up' : '/authentication/sign-in');
          return;
        }

        if (success === 'true' && token) {
          // For signup flow, check if role selection is needed
          if (isSignup) {
            // Check if user needs to complete signup (role selection, etc.)
            // If userData exists, we can prefill the signup form
            const signupUrl = new URL('/authentication/sign-up', window.location.origin);
            if (userData) {
              try {
                const parsedData = JSON.parse(decodeURIComponent(userData));
                signupUrl.searchParams.set(
                  'oauthData',
                  encodeURIComponent(JSON.stringify(parsedData)),
                );
              } catch (e) {
                console.error('Failed to parse userData:', e);
              }
            }
            signupUrl.searchParams.set('token', token);
            router.push(signupUrl.toString());
            return;
          }

          // For login flow, store token and redirect
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
          router.push(isSignup ? '/authentication/sign-up' : '/authentication/sign-in');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        const isSignup = searchParams.get('signup') === 'true';
        router.push(isSignup ? '/authentication/sign-up' : '/authentication/sign-in');
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Processing authentication...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
