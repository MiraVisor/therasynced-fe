'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaFacebook } from 'react-icons/fa';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import ForgotPasswordForm from '@/components/core/authentication/ForgotPasswordForm';
import OnboardingForm from '@/components/core/authentication/OnboardingForm';
import SignInForm from '@/components/core/authentication/SignInForm';
import SignUpForm from '@/components/core/authentication/SignUpForm';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { signUpUser } from '@/redux/slices';
import { googleSignIn } from '@/redux/slices/authSlice';

interface ClientAuthPageProps {
  authtype: string;
}

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password';

const validAuthTypes = ['sign-up', 'sign-in'];

export default function ClientAuthPage({ authtype }: ClientAuthPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>(authtype as AuthView);
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpData, setSignUpData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleNextStep = (data: any) => {
    setSignUpData((prev: any) => ({ ...prev, ...data }));
    setSignUpStep((prev) => prev + 1);
  };

  const handleFinalSubmit = (data: any) => {
    const finalData = { ...signUpData, ...data };

    setIsSubmitting(true);
    dispatch(signUpUser(finalData))
      .unwrap()
      .then((res) => {
        toast.success(res?.message || 'Sign-Up Successful');
        router.push('/dashboard');
      })
      .catch((err) => {
        toast.error(err?.message || 'Sign-Up Failed');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Google SSO handler (redirect to backend for Google OAuth)
  const handleGoogleSignIn = () => {
    // Replace with your backend's Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1'}/auth/google-signin`;
  };

  const renderAuthForm = () => {
    if (currentView === 'sign-up') {
      if (signUpStep === 1) {
        return <SignUpForm onNext={handleNextStep} initialValues={signUpData} />;
      } else if (signUpStep === 2) {
        return (
          <OnboardingForm
            onBack={() => setSignUpStep(1)}
            onSubmit={handleFinalSubmit}
            isLoading={isSubmitting}
          />
        );
      }
    }
    if (currentView === 'sign-in') return <SignInForm onForgotPassword={handleForgotPassword} />;
    if (currentView === 'forgot-password')
      return <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />;
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

        <h1 className="font-medium text-[32px] leading-[48px] tracking-normal text-center align-middle text-foreground">
          Welcome
        </h1>

        <p className="text-center text-primary mb-5">
          {currentView === 'sign-up'
            ? signUpStep === 1
              ? "Let's Create your THERASYNCED Account"
              : 'Complete your profile'
            : currentView === 'forgot-password'
              ? 'Reset Your Password'
              : 'Login to your THERASYNCED Account'}
        </p>

        {/* Only show social buttons for sign-in and sign-up */}
        {currentView !== 'forgot-password' && signUpStep === 1 && (
          <>
            {/* Social Icons  */}
            <div className="flex gap-4 mb-6 justify-center">
              {/* Apple */}
              <button
                data-tooltip-id="tooltip-apple"
                data-tooltip-content="Sign in with Apple"
                className="bg-muted dark:bg-muted text-primary p-3 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform duration-200 hover:scale-105"
              >
                <FaApple className="w-5 h-5" />
              </button>
              <ReactTooltip
                id="tooltip-apple"
                place="bottom"
                className="!bg-black !text-white !px-3 !py-1.5 !text-sm !rounded-md"
                delayShow={100}
              />

              {/* Google */}
              <button
                data-tooltip-id="tooltip-google"
                data-tooltip-content="Sign in with Google"
                className="bg-muted dark:bg-muted text-primary p-3 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform duration-200 hover:scale-105"
                onClick={handleGoogleSignIn}
                type="button"
              >
                <FcGoogle className="w-5 h-5" />
              </button>
              <ReactTooltip
                id="tooltip-google"
                place="bottom"
                className="!bg-black !text-white !px-3 !py-1.5 !text-sm !rounded-md"
                delayShow={100}
              />

              {/* Facebook */}
              <button
                data-tooltip-id="tooltip-facebook"
                data-tooltip-content="Sign in with Facebook"
                className="bg-muted dark:bg-muted text-primary p-3 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform duration-200 hover:scale-105"
              >
                <FaFacebook className="w-5 h-5 text-[#1877F2]" />
              </button>
              <ReactTooltip
                id="tooltip-facebook"
                place="bottom"
                className="!bg-black !text-white !px-3 !py-1.5 !text-sm !rounded-md"
                delayShow={100}
              />
            </div>
            {/* OR separator */}
            <div className="flex items-center text-gray-400 mb-5">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-3 text-sm font-bold">OR</span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
          </>
        )}

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
