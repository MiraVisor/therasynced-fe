'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import EmailVerificationForm from '@/components/core/authentication/EmailVerificationForm';
import ForgotPasswordForm from '@/components/core/authentication/ForgotPasswordForm';
import SignInForm from '@/components/core/authentication/SignInForm';
import { useResendVerificationEmail, useSignUp } from '@/hooks/queries/useAuth';
import { useSignupUIStore } from '@/stores/signupUIStore';
import type { SignUpDto } from '@/types';

import MultiStepSignup from './MultiStepSignup';

interface ClientAuthPageProps {
  authtype: string;
}

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'email-verification';

const validAuthTypes = ['sign-up', 'sign-in'];

export default function ClientAuthPage({ authtype }: ClientAuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<AuthView>(authtype as AuthView);
  const [userEmail, setUserEmail] = useState('');

  const { mutate: signup, isPending: isSubmitting } = useSignUp();
  const { mutate: resendEmail } = useResendVerificationEmail();

  // Clean up reset success parameter from URL if present
  useEffect(() => {
    const resetSuccess = searchParams.get('reset');
    if (resetSuccess === 'success' && currentView === 'sign-in') {
      const url = new URL(window.location.href);
      url.searchParams.delete('reset');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, currentView, router]);

  if (!validAuthTypes.includes(authtype)) {
    return notFound();
  }

  // Handle forgot password action
  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  // Handle back to sign in
  const handleBackToSignIn = () => {
    setCurrentView('sign-in');
  };

  const handleSignUpSubmit = (data: SignUpDto) => {
    setUserEmail(data.email);
    const isOAuthSignup = !!data.oauthSignupToken;

    // Debug: Verify oauthSignupToken is included
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[Signup Submit] Submitting with oauthSignupToken:',
        isOAuthSignup ? 'present' : 'missing',
      );
      if (isOAuthSignup && !data.oauthSignupToken) {
        console.error(
          '[Signup Submit] ERROR: isOAuthSignup is true but oauthSignupToken is missing!',
        );
      }
    }

    signup(data, {
      onSuccess: () => {
        // Clean up OAuth signup flags after successful submission
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('oauth_signup_in_progress');
          sessionStorage.removeItem('oauth_signup_token'); // Remove token after successful signup
        }

        // For OAuth signup, user is auto-logged in and redirected to dashboard
        // For email signup, show email verification page
        if (!isOAuthSignup) {
          setCurrentView('email-verification');
        }
        // OAuth signup redirects to dashboard automatically via useSignUp hook
      },
      onError: (error) => {
        // Don't remove token on error - user might want to retry
        console.error('[Signup Submit] Signup failed:', error);
      },
    });
  };

  const handleBackToSignInFromSignup = () => {
    // Clear all signup state when going back to login
    if (typeof window !== 'undefined') {
      // Clear OAuth signup tokens and flags
      sessionStorage.removeItem('oauth_signup_token');
      sessionStorage.removeItem('oauth_signup_in_progress');

      // Clear URL parameters (oauthData, token, etc.)
      const url = new URL(window.location.href);
      url.searchParams.delete('oauthData');
      url.searchParams.delete('token');
      url.searchParams.delete('signup');
      window.history.replaceState({}, '', url.pathname);
    }

    // Reset signup UI store state
    const { resetSignupUI } = useSignupUIStore.getState();
    resetSignupUI();

    // Navigate to sign-in
    setCurrentView('sign-in');
    window.history.pushState({}, '', '/authentication/sign-in');
  };

  const handleResendEmail = () => {
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }
    resendEmail({ email: userEmail });
  };

  const renderAuthForm = () => {
    if (currentView === 'sign-up') {
      return (
        <MultiStepSignup
          onSubmit={(data) => {
            // Get OAuth signup token from sessionStorage if available
            const oauthSignupToken =
              typeof window !== 'undefined' ? sessionStorage.getItem('oauth_signup_token') : null;

            // Debug: Log token retrieval
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[Signup Submit] OAuth token retrieved:',
                oauthSignupToken ? 'present' : 'missing',
              );
              console.log('[Signup Submit] Form data:', {
                name: data.name,
                email: data.email,
                role: data.role,
                hasOAuthToken: !!oauthSignupToken,
              });
            }

            // Convert MultiStepSignup data format to SignUpDto
            const signupData: SignUpDto = {
              name: data.name,
              email: data.email,
              password: data.password ?? undefined, // Only include if provided
              oauthSignupToken: oauthSignupToken ?? undefined, // Include if OAuth signup - REQUIRED when password is empty
              role: data.role as 'PATIENT' | 'FREELANCER',
              dob: data.dob,
              gender: data.gender,
              county: data.county,
              cityTown: data.cityTown,
              homeAddress: data.homeAddress,
              clinicAddress: data.clinicAddress,
              mainJobTitleId: data.mainJobTitleId,
              profilePicture: data.profilePicture, // Include profilePicture from OAuth
              termsConsent: data.termsConsent,
              privacyConsent: data.privacyConsent,
              gdprConsent: data.gdprConsent,
            };

            // Validate OAuth signup: if no password, must have oauthSignupToken
            if (!data.password && !oauthSignupToken) {
              toast.error('OAuth signup token is missing. Please try signing up again.');
              console.error('[Signup Submit] Missing oauthSignupToken for OAuth signup');
              return;
            }

            // Debug: Log final signup data (without token for security)
            if (process.env.NODE_ENV === 'development') {
              console.log('[Signup Submit] Final signup data:', {
                ...signupData,
                oauthSignupToken: oauthSignupToken ? 'present' : 'missing',
              });
            }

            // Clean up sessionStorage after retrieving token (but only after successful submission)
            // Don't remove it here - let the success handler remove it
            handleSignUpSubmit(signupData);
          }}
          onBack={handleBackToSignInFromSignup}
          isLoading={isSubmitting}
        />
      );
    }
    if (currentView === 'sign-in') return <SignInForm onForgotPassword={handleForgotPassword} />;
    if (currentView === 'forgot-password')
      return <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />;
    if (currentView === 'email-verification') {
      return (
        <EmailVerificationForm
          onBack={handleBackToSignInFromSignup}
          email={userEmail || ''}
          onResendEmail={handleResendEmail}
        />
      );
    }
    return null;
  };

  const handleBackToLanding = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Full Page Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={handleBackToLanding}
              className="inline-flex items-center gap-2 text-sm font-inter text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="Back to landing page"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/svgs/NewLogoDark.svg"
              alt="Therasynced Logo"
              width={100}
              height={90}
              priority={true}
            />
          </div>

          {/* Form Content - No card styling */}
          <div className="w-full min-h-[500px] flex flex-col">
            {/* Form - Takes full height */}
            <div className="flex-1 min-h-0 flex flex-col">{renderAuthForm()}</div>

            {/* Footer - Toggle between sign in/sign up */}
            {(currentView === 'sign-in' || currentView === 'sign-up') && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex flex-row items-center justify-center gap-2 text-center">
                  <p className="text-xs font-inter text-gray-600">
                    {currentView === 'sign-up'
                      ? 'Already have an account?'
                      : "Don't have an account?"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView(currentView === 'sign-up' ? 'sign-in' : 'sign-up');
                      window.history.pushState(
                        {},
                        '',
                        `/authentication/${currentView === 'sign-up' ? 'sign-in' : 'sign-up'}`,
                      );
                    }}
                    className="text-xs font-inter font-semibold text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    {currentView === 'sign-up' ? 'Sign In' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Text */}
          <div className="mt-6 text-center">
            <p className="text-xs font-inter text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
