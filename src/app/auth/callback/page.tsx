'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { setCookie } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

function AuthCallbackContent() {
  const [isProcessing, setIsProcessing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const returnUrl = searchParams.get('returnUrl');
        const isSignup = searchParams.get('signup') === 'true';
        const userData = searchParams.get('userData'); // OAuth user data if available

        // Debug: Log callback parameters to verify signup flow
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth Callback] Parameters:', {
            token: token ? 'present' : 'missing',
            success,
            isSignup,
            hasUserData: !!userData,
            returnUrl,
          });
        }

        if (error) {
          toast.error(decodeURIComponent(error));
          router.push(isSignup ? '/authentication/sign-up' : '/authentication/sign-in');
          return;
        }

        if (success === 'true' && token) {
          // For signup flow, NEVER store token in cookies or login
          // Only store temporary token in sessionStorage for signup completion
          if (isSignup) {
            // Store temporary token in sessionStorage (NOT cookies)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('oauth_signup_token', token);
              // Set a flag to indicate OAuth signup is in progress
              sessionStorage.setItem('oauth_signup_in_progress', 'true');

              // Debug: Verify token is stored
              if (process.env.NODE_ENV === 'development') {
                const storedToken = sessionStorage.getItem('oauth_signup_token');
                console.log(
                  '[Auth Callback] OAuth signup token stored:',
                  storedToken ? 'present' : 'missing',
                );
                console.log('[Auth Callback] Token length:', storedToken?.length || 0);
              }
            }

            // Redirect to sign-up form with OAuth data
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
            // Don't include token in URL - it's already in sessionStorage
            router.push(signupUrl.toString());
            return;
          }

          // For login flow, store token and redirect
          if (typeof window !== 'undefined') {
            setCookie('token', token);
            login(token, 'PATIENT');
            // User data will be fetched by API interceptor
          }

          // Redirect to the intended page or dashboard
          const finalUrl = returnUrl || '/dashboard';
          router.push(
            finalUrl +
              (finalUrl === '/dashboard'
                ? `?login=google&message=${encodeURIComponent(
                    'Successfully signed in with Google!',
                  )}`
                : ''),
          );
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
  }, [searchParams, router, login]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Processing authentication...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
