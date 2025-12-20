'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { loginUser } from '@/redux/slices/authSlice';

import GoogleSignInButton from './GoogleSignInButton';

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
      // Navigate immediately - Redux state updates synchronously
      // Use replace to prevent back navigation to login page
      router.replace('/dashboard');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Login Failed');
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-charcoal">Sign In</h2>
        <p className="text-sm font-inter text-gray-600">Sign in to continue to your dashboard</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* OAuth Options */}
        <GoogleSignInButton />

        <div className="relative">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 font-inter">or continue with email</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-inter font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-sm font-inter"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-inter mt-0.5">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-inter font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white text-sm font-inter"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-inter mt-0.5">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full h-10 font-inter font-semibold rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 text-sm"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
