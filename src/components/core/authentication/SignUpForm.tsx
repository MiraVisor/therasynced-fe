import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
export default function SignUpForm() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-therasynced-background rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <img
            src="/svgs/therasynced_logo.svg"
            alt="Therasynced Logo"
            className="h-14"
          />
        </div>

        <h1 className="text-3xl font-semibold text-therasynced-primary text-center mb-1">
          Welcome
        </h1>
        <p className="text-center text-therasynced-textGray mb-8">
          Let’s Login to your THERASYNCED Account
        </p>

        {/* Social Buttons */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-gray-100 text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition">
            <span></span>
            Continue with Apple
          </button>
          <button className="w-full bg-gray-100 text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition">
            <FcGoogle />
            Continue with Google
          </button>
          <button className="w-full bg-gray-100 text-black flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-200 transition">
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

        {/* Form Fields */}
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-therasynced-primary font-semibold mb-1"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ex: Maguire@gmail.com"
              className="w-full rounded-lg bg-therasynced-inputBg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-therasynced-secondary"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-therasynced-primary font-semibold mb-1"
            >
              Your Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ex: Maguire@gmail.com"
              className="w-full rounded-lg bg-therasynced-inputBg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-therasynced-secondary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-therasynced-primary font-semibold mb-1"
            >
              Create Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="w-full rounded-lg bg-therasynced-inputBg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-therasynced-secondary"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                👁️
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-therasynced-primary text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Create Account →
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an Account?{" "}
          <a
            href="/authentication/sign-in"
            className="text-therasynced-primary font-semibold hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
