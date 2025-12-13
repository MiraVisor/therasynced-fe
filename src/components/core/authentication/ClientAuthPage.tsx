'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import EmailVerificationForm from '@/components/core/authentication/EmailVerificationForm';
import ForgotPasswordForm from '@/components/core/authentication/ForgotPasswordForm';
import SignInForm from '@/components/core/authentication/SignInForm';
import { sendVerificationEmailApi } from '@/redux/api/authApi';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { signUpUser } from '@/redux/slices/authSlice';

import MultiStepSignup from './MultiStepSignup';

interface ClientAuthPageProps {
  authtype: string;
}

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'email-verification';

const validAuthTypes = ['sign-up', 'sign-in'];

export default function ClientAuthPage({ authtype }: ClientAuthPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>(authtype as AuthView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

  const handleSignUpSubmit = (data: any) => {
    setIsSubmitting(true);
    setUserEmail(data.email);

    dispatch(signUpUser(data))
      .unwrap()
      .then((res) => {
        toast.success(
          'Account created successfully! Please check your email for the verification link.',
        );
        // Show email verification page instead of redirecting to dashboard
        setCurrentView('email-verification');
      })
      .catch((err) => {
        toast.error(err?.message || 'Sign-Up Failed');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleBackToSignInFromSignup = () => {
    setCurrentView('sign-in');
    window.history.pushState({}, '', '/authentication/sign-in');
  };

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }

    try {
      await sendVerificationEmailApi({ email: userEmail });
      toast.success('Verification email resent to your inbox');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend verification email');
    }
  };

  const renderAuthForm = () => {
    if (currentView === 'sign-up') {
      return (
        <MultiStepSignup
          onSubmit={handleSignUpSubmit}
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
          email={userEmail}
          onResendEmail={handleResendEmail}
        />
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Full Page Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/svgs/therasynced_logo.svg"
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
                <div className="text-center">
                  <p className="text-xs font-inter text-gray-600 mb-2">
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
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
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
