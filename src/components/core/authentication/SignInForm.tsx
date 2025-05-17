"use client";
import CustomInput from "@/components/common/input/CustomInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";


const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});


type FormData = z.infer<typeof formSchema>;

const SignInForm = ({ onForgotPassword }: { onForgotPassword: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Form Submitted:", data);
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustomInput
        title="Email"
        placeholder="Enter your email"
        type="email"
        {...register("email")}
        errorMessage={errors.email?.message}
        ariaInvalid={!!errors.email}
      />
      <CustomInput
        title="Password"
        placeholder="Enter your password"
        type="password"
        {...register("password")}
        errorMessage={errors.password?.message}
        ariaInvalid={!!errors.password}
      />
      {/* Forgot Password Link */}
      <p
        className="text-sm text-red-600 cursor-pointer hover:underline"
        onClick={onForgotPassword}
      >
        Forgot Password?
      </p>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-semibold py-3 rounded-lg transition bg-primary text-white dark:bg-mutedForeground dark:text-foreground"
      >
        {isSubmitting ? "Submitting..." : "Login →"}
      </Button>
    </form>
  );
};

export default SignInForm;
