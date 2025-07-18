'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { loginUser } from '@/redux/slices';

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // .regex(
  //   /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/,
  //   'Password must include lowercase and number, and be at least 8 characters',
  // ),
});

type FormData = z.infer<typeof formSchema>;

const SignInForm = ({ onForgotPassword }: { onForgotPassword: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
  });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await dispatch(loginUser(data)).unwrap();
      toast.success(res?.message || 'Login Successful');
      router.push('/dashboard');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Login Failed');
    }
  };

  const handleGoogleSignIn = () => {
    // Replace with your backend's Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1'}/auth/google-signin`;
  };

  const handleOAuthLogin = (provider: string) => {
    // TODO: Implement OAuth login
    console.log(`Logging in with ${provider}`);
    if (provider === 'google') {
      handleGoogleSignIn();
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-600">Sign in to your account to continue</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {/* OAuth Options */}
        <div className="space-y-3 mb-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            className="w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 font-medium">or continue with email</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-sm shadow-sm"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-sm shadow-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full h-10 font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm shadow-sm"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
