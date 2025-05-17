import SignInForm from "@/components/core/authentication/SignInForm";
import AuthForm from "@/components/core/authentication/SignUpForm";
import { notFound } from "next/navigation";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
interface AuthPageProps {
  params: {
    authtype: string;
  };
}

const validAuthTypes = ["sign-up", "sign-in"];

export default function AuthPage({ params }: AuthPageProps) {
  const { authtype } = params;

  if (!validAuthTypes.includes(authtype)) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-therasynced-background rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <img
            src="/svgs/therasynced_logo.svg"
            alt="Therasynced Logo"
            className="h-14"
          />
        </div>
        <h1 className="font-medium text-[32px] leading-[48px] tracking-normal text-center align-middle text-foreground">
          Welcome
        </h1>

        <p className="text-center text-[16px] leading-[48px] tracking-normal align-middle text-foreground mb-8">
          Let’s {authtype === "sign-up" ? "Create an Account" : "Login"} to your
          THERASYNCED Account
        </p>
        {/* Social Buttons */}
        <div className="space-y-3 mb-8">
          <button
            className="w-full bg-[#F8F8F8] text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]
"
          >
            <span></span>
            Continue with Apple
          </button>
          <button className="w-full bg-[#F8F8F8] text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]">
            <FcGoogle />
            Continue with Google
          </button>
          <button className="w-full bg-[#F8F8F8] text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition max-h-[40px]">
            <FaFacebook />
            Continue with Facebook
          </button>
        </div>

        {/* OR separator */}
        <div className="flex items-center text-gray-400 mb-8">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-sm">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        {/* <SignInForm /> */}
        <SignInForm />

        <p className="text-center text-gray-400 mt-6 text-sm">
          {authtype === "sign-up"
            ? "Already have an Account?"
            : "Don't have an Account?"}{" "}
          <a
            href={`/authentication/${
              authtype === "sign-up" ? "sign-in" : "sign-up"
            }`}
            className="text-therasynced-primary font-semibold hover:underline"
          >
            {authtype === "sign-up" ? "Log In" : "Sign Up"}
          </a>
        </p>
      </div>
    </div>
  );
}
