'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import EmailVerificationForm from '@/components/core/authentication/EmailVerificationForm';
import ForgotPasswordForm from '@/components/core/authentication/ForgotPasswordForm';
import SignInForm from '@/components/core/authentication/SignInForm';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { signUpUser } from '@/redux/slices';

import MultiStepSignup from './MultiStepSignup';

interface ClientAuthPageProps {
  authtype: string;
}

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'email-verification';

const validAuthTypes = ['sign-up', 'sign-in'];

export default function ClientAuthPage({ authtype }: ClientAuthPageProps) {
  const dispatch = useAppDispatch();
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
        toast.success(res?.message || 'Account created! Please check your email for verification.');
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
    // TODO: Implement resend verification email API call
    toast.info('Verification email resent to your inbox');
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
    <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4 bg-[url('/svgs/signup_bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full px-6 py-3 min-h-[650px]">
        <div className="flex justify-center mb-1">
          <Image
            src="/svgs/therasynced_logo.svg"
            alt="Therasynced Logo"
            width={86}
            height={77}
            priority={true}
          />
        </div>

        {renderAuthForm()}

        {(currentView === 'sign-in' || currentView === 'sign-up') && (
          <p className="text-center text-[var(--primary)] mt-6 text-sm">
            {currentView === 'sign-up' ? 'Already have an Account?' : "Don't have an Account?"}{' '}
            <a
              href={`/authentication/${currentView === 'sign-up' ? 'sign-in' : 'sign-up'}`}
              className="text-[var(--primary)] font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(currentView === 'sign-up' ? 'sign-in' : 'sign-up');
                window.history.pushState(
                  {},
                  '',
                  `/authentication/${currentView === 'sign-up' ? 'sign-in' : 'sign-up'}`,
                );
              }}
            >
              {currentView === 'sign-up' ? 'Log In' : 'Sign Up'}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
