"use client";
import { useState } from "react";
import SignInForm from "@/components/core/authentication/SignInForm";
import SignUpForm from "@/components/core/authentication/SignUpForm";
import ForgotPasswordForm from "@/components/core/authentication/ForgotPasswordForm";
import { notFound, useRouter } from "next/navigation";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Image from "next/image";
import OnboardingForm from "@/components/core/authentication/OnboardingForm";
import { useAppDispatch } from "@/redux/hooks/useAppHooks";
import { signUpUser } from "@/redux/slices";
import { toast } from "react-toastify";
interface ClientAuthPageProps {
  authtype: string;
}

type AuthView = "sign-in" | "sign-up" | "forgot-password";

const validAuthTypes = ["sign-up", "sign-in"];

export default function ClientAuthPage({ authtype }: ClientAuthPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>(
    authtype as AuthView
  );
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpData, setSignUpData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleNextStep = (data: any) => {
    setSignUpData((prev: any) => ({ ...prev, ...data }));
    setSignUpStep((prev) => prev + 1);
  };

  const handleFinalSubmit = (data: any) => {
    const finalData = { ...signUpData, ...data };
    console.log("Final Sign-Up Payload", finalData);
    setIsSubmitting(true);
    dispatch(signUpUser(finalData))
      .unwrap()
      .then((res) => {
        toast.success(res?.message || "Sign-Up Successful");
        router.push("/");
        console.log("Sign-Up Response", res);
      })
      .catch((err) => {
        toast.error(err?.message || "Sign-Up Failed");
        console.error("Sign-Up Error", err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const renderAuthForm = () => {
    if (currentView === "sign-up") {
      if (signUpStep === 1) {
        return (
          <SignUpForm onNext={handleNextStep} initialValues={signUpData} />
        );
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
    if (currentView === "sign-in")
      return <SignInForm onForgotPassword={handleForgotPassword} />;
    if (currentView === "forgot-password")
      return <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4 bg-[url('/svgs/signup_bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full px-6 py-3">
        <div className="flex justify-center mb-1">
          <Image
            src="/svgs/therasynced_logo.svg"
            alt="Therasynced Logo"
            width={86}
            height={77}
            priority={true}
          />
        </div>
        <ThemeToggle />
        <h1 className="font-medium text-[32px] leading-[48px] tracking-normal text-center align-middle text-foreground">
          Welcome
        </h1>

        <p className="text-center text-primary mb-3">
          {currentView === "sign-up"
            ? signUpStep === 1
              ? "Let's Create your THERASYNCED Account"
              : "Complete your profile"
            : currentView === "forgot-password"
            ? "Reset Your Password"
            : "Login to your THERASYNCED Account"}
        </p>

        {/* Only show social buttons for sign-in and sign-up */}
        {currentView !== "forgot-password" && signUpStep === 1 && (
          <>
            {/* Social Buttons */}
            <div className="space-y-1.5 mb-6">
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition max-h-[40px]">
                <FaApple />
                Continue with Apple
              </button>
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition max-h-[40px]">
                <FcGoogle />
                Continue with Google
              </button>
              <button className="w-full bg-[#ebefed] dark:bg-muted text-primary  flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition max-h-[40px]">
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
