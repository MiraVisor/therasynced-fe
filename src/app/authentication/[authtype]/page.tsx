"use client";
import { useState } from "react";
import SignInForm from "@/components/core/authentication/SignInForm";
import SignUpForm from "@/components/core/authentication/SignUpForm";
import ForgotPasswordForm from "@/components/core/authentication/ForgotPasswordForm";
import { notFound } from "next/navigation";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Image from "next/image";
interface AuthPageProps {
  params: {
    authtype: string;
  };
}

type AuthView = "sign-in" | "sign-up" | "forgot-password";

const validAuthTypes = ["sign-up", "sign-in"];

export default function AuthPage({ params }: AuthPageProps) {
  const { authtype } = params;

  const [currentView, setCurrentView] = useState<AuthView>(
    authtype as AuthView
  );
  // State to track if we're showing the OTP verification screen
  const [showOtp, setShowOtp] = useState(false);
  if (!validAuthTypes.includes(authtype)) {
    return notFound();
  }

  // Handle forgot password action
  const handleForgotPassword = () => {
    setCurrentView("forgot-password");
  };

  // Handle back to sign in
  const handleBackToSignIn = () => {
    setCurrentView("sign-in");
    setShowOtp(false);
  };

  // Handle OTP verification request
  const handleRequestOtp = () => {
    setShowOtp(true);
  };

  // Determine which form to show based on current view
  const renderAuthForm = () => {
    switch (currentView) {
      case "sign-in":
        return <SignInForm onForgotPassword={handleForgotPassword} />;
      case "sign-up":
        return <SignUpForm />;
      case "forgot-password":
        return <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />;
      default:
        return <SignInForm onForgotPassword={handleForgotPassword} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-2 px-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="flex justify-center mb-2">
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
          {/* <ThemeToggle /> */}
        </h1>

        <p className="text-center text-[16px] leading-[48px] tracking-normal align-middle text-primary mb-3">
          {currentView === "sign-up"
            ? "Let's Create your THERASYNCED Account"
            : currentView === "forgot-password"
            ? "Reset Your Password"
            : "Login to your THERASYNCED Account"}
        </p>

        {/* Only show social buttons for sign-in and sign-up */}
        {currentView !== "forgot-password" && (
          <>
            {/* Social Buttons */}
            <div className="space-y-1.5 mb-6">
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]">
                <FaApple />
                Continue with Apple
              </button>
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]">
                <FcGoogle />
                Continue with Google
              </button>
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary  flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]">
                <FaFacebook />
                Continue with Facebook
              </button>
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
        {(currentView === "sign-in" || currentView === "sign-up") && (
          <p className="text-center text-[var(--primary)] mt-6 text-sm">
            {currentView === "sign-up"
              ? "Already have an Account?"
              : "Don't have an Account?"}{" "}
            <a
              href={`/authentication/${
                currentView === "sign-up" ? "sign-in" : "sign-up"
              }`}
              className="text-[var(--primary)] font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(
                  currentView === "sign-up" ? "sign-in" : "sign-up"
                );
                window.history.pushState(
                  {},
                  "",
                  `/authentication/${
                    currentView === "sign-up" ? "sign-in" : "sign-up"
                  }`
                );
              }}
            >
              {currentView === "sign-up" ? "Log In" : "Sign Up"}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
