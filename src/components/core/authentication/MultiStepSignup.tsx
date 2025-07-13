'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Chrome,
  Github,
  Shield,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DatePicker } from '@/components/common/input/DatePicker';
import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { genderOptions, roleOptions } from '@/config/onboardingConfig';
import { cn } from '@/lib/utils';

// Zod schema for form validation
const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    gender: z.string().min(1, 'Gender is required'),
    dob: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((date) => {
        if (!date) return false;
        const selectedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();
        // Check if birthday has occurred this year
        const isBirthdayPassed =
          monthDiff > 0 || (monthDiff === 0 && today.getDate() >= selectedDate.getDate());
        const actualAge = isBirthdayPassed ? age : age - 1;
        return actualAge >= 18;
      }, 'You must be at least 18 years old to register'),
    city: z.string().min(1, 'Location is required'),
    role: z.string().min(1, 'Role is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    documents: z.array(z.instanceof(File)).optional(),
    portfolio: z.string().optional(),
    experience: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface MultiStepSignupProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    icon: User,
  },
  {
    id: 2,
    title: 'Role',
    icon: Users,
  },
  {
    id: 3,
    title: 'Account',
    icon: Shield,
  },
  {
    id: 4,
    title: 'Documents',
    icon: Upload,
  },
];

export default function MultiStepSignup({ onBack, onSubmit, isLoading }: MultiStepSignupProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    setValue,
    getValues,
    trigger,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      gender: 'male',
      dob: '',
      city: '',
      role: 'patient',
      email: '',
      password: '',
      confirmPassword: '',
      documents: [],
      portfolio: '',
      experience: '',
    },
    mode: 'onTouched',
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          getValues('name') &&
          getValues('gender') &&
          getValues('dob') &&
          getValues('city') &&
          !errors.dob
        );
      case 2:
        return getValues('role');
      case 3:
        return (
          getValues('email') &&
          getValues('password') &&
          getValues('confirmPassword') &&
          getValues('password') === getValues('confirmPassword')
        );
      case 4:
        return true; // All fields are optional for step 4
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const transformedData = {
      ...getValues(),
      role: getValues('role').toUpperCase(),
    };
    onSubmit(transformedData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 col-span-full">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Gender
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {genderOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 border',
                        watch('gender') === option.value
                          ? 'border-primary bg-white text-black shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5',
                      )}
                      onClick={() => setValue('gender', option.value)}
                    >
                      <IconComponent className="h-4 w-4 mb-1" />
                      <span className="text-xs font-medium text-center">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
              )}
            </div>

            <DatePicker
              title="Date of Birth"
              onChange={(date) => {
                setValue('dob', date?.toISOString() ?? '');
                trigger('dob');
              }}
            />
            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}

            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Location
              </label>
              <LocationDropdown
                value={watch('city')}
                onValueChange={(value) => {
                  setValue('city', value);
                  trigger('city');
                }}
                placeholder="Type or select your city, town, or village"
                searchPlaceholder="Search locations..."
                emptyMessage="No location found."
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
              Choose Role
            </label>
            <div className="flex flex-col gap-2">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-200 border flex-1',
                      watch('role') === option.value
                        ? 'border-primary bg-white text-black shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5',
                    )}
                    onClick={() => setValue('role', option.value)}
                  >
                    <IconComponent className="h-5 w-5 mb-2" />
                    <span className="text-xs font-medium text-center">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {/* OAuth Options */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or continue with</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-gray-200 hover:bg-gray-50 text-sm"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-gray-200 hover:bg-gray-50 text-sm"
                >
                  <Chrome className="h-4 w-4" />
                  Google
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* <div className="bg-secondary p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Account Summary</h4>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Role:</strong> {formData.role}
                </p>
                <p>
                  <strong>Location:</strong> {formData.city}
                </p>
              </div>
            </div> */}
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">You&apos;re all set!</h3>
            <p className="text-sm text-gray-600 max-w-md">
              {watch('role') === 'freelancer'
                ? 'Your profile is ready. You can add documents and additional information later from your dashboard.'
                : 'Your account is ready to be created. Click "Complete Signup" to finish the registration process.'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress Steps */}
      {/* <div className="mb-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200',
                    currentStep >= step.id
                      ? 'bg-primary border-primary text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400',
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <span className="text-xs font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-4 h-0.5 mx-1 transition-all duration-200',
                      currentStep > step.id ? 'bg-primary' : 'bg-gray-300',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-1">
          <p className="text-xs text-gray-600">
            Step {currentStep} of {steps.length}
          </p>
        </div>
      </div> */}

      {/* Step Content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="mt-3">
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onBack : prevStep}
            className="px-4 py-2 rounded-lg border border-gray-300 text-foreground hover:bg-gray-50 transition-colors text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? 'Back' : 'Previous'}
          </Button>
          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-4 py-2 rounded-lg font-semibold transition bg-primary text-white dark:bg-primary dark:text-white hover:bg-[#015d33] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="px-4 py-2 rounded-lg font-semibold transition bg-primary text-white dark:bg-primary dark:text-white hover:bg-[#015d33] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              isLoading={isLoading}
            >
              Complete Signup
            </Button>
          )}
        </div>
      </div>

      {/* Debug section - hidden by default */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-xs mb-1">Debug - Current Form Data:</h3>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-20">
            {JSON.stringify({ ...getValues(), currentStep }, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
