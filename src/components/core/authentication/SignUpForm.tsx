"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import CustomInput from "@/components/common/input/CustomInput";
import { Button } from "@/components/ui/button";

// Zod Schema for Validation
const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email").max(100, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

// Infer type
type SignUpFormData = z.infer<typeof signupSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    console.log("Submitted data:", data);
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate API call
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustomInput
        title="Name"
        placeholder="Enter your full name"
        type="text"
        {...register("name")}
        errorMessage={errors.name?.message}
        ariaInvalid={!!errors.name}
      />

      <CustomInput
        title="Email"
        placeholder="Enter your email"
        type="email"
        {...register("email")}
        errorMessage={errors.email?.message}
        ariaInvalid={!!errors.email}
      />

      <CustomInput
        title="Create Password"
        placeholder="Create a strong password"
        type="password"
        {...register("password")}
        errorMessage={errors.password?.message}
        ariaInvalid={!!errors.password}
      />
      <div className="mt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-semibold py-3 rounded-lg transition bg-primary text-white dark:bg-mutedForeground dark:text-foreground mt-4"
        >
          {isSubmitting ? "Creating Account..." : "Create Account →"}
        </Button>
      </div>
    </form>
  );
}
