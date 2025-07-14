'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import CustomInput from '@/components/common/input/CustomInput';
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
      toast.success(res?.message || 'Sign-Up Successful');
      router.push('/dashboard');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Sign-Up Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustomInput
        title="Email"
        placeholder="Enter your email"
        type="email"
        {...register('email')}
        errorMessage={errors.email?.message}
        ariaInvalid={!!errors.email}
      />
      <CustomInput
        title="Password"
        placeholder="Enter your password"
        type="password"
        {...register('password')}
        errorMessage={errors.password?.message}
        ariaInvalid={!!errors.password}
      />
      {/* Forgot Password Link */}
      <p className="text-sm text-red-600 cursor-pointer hover:underline" onClick={onForgotPassword}>
        Forgot Password?
      </p>
      <Button
        type="submit"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full font-semibold py-3 rounded-lg transition bg-primary text-white dark:bg-primary dark:text-white mt-4 hover:bg-[#015d33]"
      >
        {'Login →'}
      </Button>
    </form>
  );
};

export default SignInForm;
