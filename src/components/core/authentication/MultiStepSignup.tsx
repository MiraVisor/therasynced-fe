'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ChevronLeft, ChevronRight, Chrome, Eye, EyeOff, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
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
        const isBirthdayPassed =
          monthDiff > 0 || (monthDiff === 0 && today.getDate() >= selectedDate.getDate());
        const actualAge = isBirthdayPassed ? age : age - 1;
        return actualAge >= 18;
      }, 'You must be at least 18 years old to register'),
    city: z.string().min(1, 'Location is required'),
    role: z.string().min(1, 'Role is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
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
  { id: 1, title: 'Name', description: 'Your full name' },
  { id: 2, title: 'Gender', description: 'Your gender' },
  { id: 3, title: 'Birth Date', description: 'Date of birth' },
  { id: 4, title: 'Location', description: 'Where you are' },
  { id: 5, title: 'Role', description: "How you'll use the platform" },
  { id: 6, title: 'Account', description: 'Email or OAuth' },
  { id: 7, title: 'Password', description: 'Secure password' },
];

export default function MultiStepSignup({ onBack, onSubmit, isLoading }: MultiStepSignupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'oauth' | null>(null);

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
      gender: '',
      dob: '',
      city: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Trigger validation when step changes to ensure existing values are validated
  useEffect(() => {
    const validateCurrentStepFields = async () => {
      switch (currentStep) {
        case 1:
          await trigger('name');
          break;
        case 2:
          await trigger('gender');
          break;
        case 3:
          await trigger('dob');
          break;
        case 4:
          await trigger('city');
          break;
        case 5:
          await trigger('role');
          break;
        case 6:
          // Step 6 doesn't need validation, just auth method selection
          break;
        case 7:
          await trigger(['password', 'confirmPassword']);
          break;
      }
    };

    validateCurrentStepFields();
  }, [currentStep, trigger]);

  const nextStep = async () => {
    if (currentStep === 6 && authMethod === 'oauth') {
      // Handle OAuth signup
      handleOAuthSignup('google');
      return;
    }

    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 7) {
        setAuthMethod(null);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await trigger('name');
      case 2:
        return await trigger('gender');
      case 3:
        return await trigger('dob');
      case 4:
        return await trigger('city');
      case 5:
        return await trigger('role');
      case 6:
        // Step 6 doesn't need validation, just auth method selection
        return true;
      case 7:
        return await trigger(['email', 'password', 'confirmPassword']);
      default:
        return false;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        const name = getValues('name');
        return name && name.length >= 2 && !errors.name;
      case 2:
        const gender = getValues('gender');
        return gender && !errors.gender;
      case 3:
        const dob = getValues('dob');
        return dob && !errors.dob;
      case 4:
        const city = getValues('city');
        return city && !errors.city;
      case 5:
        const role = getValues('role');
        return role && !errors.role;
      case 6:
        // Step 6 just needs an auth method selected
        return authMethod === 'email' || authMethod === 'oauth';
      case 7:
        const email = getValues('email');
        const password = getValues('password');
        const confirmPassword = getValues('confirmPassword');
        return (
          email &&
          email.includes('@') &&
          !errors.email &&
          password &&
          confirmPassword &&
          password === confirmPassword &&
          !errors.password &&
          !errors.confirmPassword
        );
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const formValues = getValues();
    const { confirmPassword, ...submitData } = formValues;
    const transformedData = {
      ...submitData,
      role: submitData.role.toUpperCase(),
    };
    onSubmit(transformedData);
  };

  const handleGoogleSignIn = () => {
    // Replace with your backend's Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1'}/auth/google-signin`;
  };

  const handleOAuthSignup = (provider: string) => {
    console.log(`Signing up with ${provider}`);
    // TODO: Implement OAuth signup and redirect to dashboard
    if (provider === 'google') {
      handleGoogleSignIn();
    }
  };

  const handleAuthMethodSelect = (method: 'email' | 'oauth') => {
    setAuthMethod(method);
    if (method === 'oauth') {
      // For OAuth, we can proceed directly or handle it differently
      console.log('OAuth selected');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">What&apos;s your name?</h3>
              <p className="text-sm text-gray-600">
                Enter your full name as it appears on official documents
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                {...register('name')}
                className={cn(
                  'w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-base shadow-sm',
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-primary',
                )}
                placeholder="Enter your full name"
                autoFocus
              />
              {/* {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name.message}
                </p>
              )} */}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">What&apos;s your gender?</h3>
              <p className="text-sm text-gray-600">This helps us personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {genderOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-primary/20',
                        watch('gender') === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-primary/5',
                      )}
                      onClick={async () => {
                        setValue('gender', option.value);
                        await trigger('gender');
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setValue('gender', option.value);
                          await trigger('gender');
                        }
                      }}
                      tabIndex={0}
                      role="radio"
                      aria-checked={watch('gender') === option.value}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {/* {errors.gender && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.gender.message}
                </p>
              )} */}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">When were you born?</h3>
              <p className="text-sm text-gray-600">You must be at least 18 years old to register</p>
            </div>

            <div className="space-y-4">
              <DatePicker
                title=""
                onChange={(date) => {
                  setValue('dob', date?.toISOString() ?? '');
                  trigger('dob');
                }}
                value={getValues('dob') ? new Date(getValues('dob')) : undefined}
              />
              {/* {errors.dob && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.dob.message}
                </p>
              )} */}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Where are you located?</h3>
              <p className="text-sm text-gray-600">This helps us connect you with local services</p>
            </div>

            <div className="space-y-4">
              <div
                className={cn(
                  'border rounded-lg',
                  errors.city ? 'border-red-500' : 'border-gray-200',
                )}
              >
                <LocationDropdown
                  value={watch('city')}
                  onValueChange={(value) => {
                    setValue('city', value);
                    trigger('city');
                  }}
                  placeholder="Select your city"
                  searchPlaceholder="Search locations..."
                  emptyMessage="No location found."
                />
              </div>
              {/* {errors.city && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.city.message}
                </p>
              )} */}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="w-full max-w-lg space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">How will you use Therasynced?</h3>
              <p className="text-sm text-gray-600">
                Choose the option that best describes your needs
              </p>
            </div>

            <div className="space-y-4">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2',
                      watch('role') === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-primary/5',
                    )}
                    onClick={async () => {
                      setValue('role', option.value);
                      await trigger('role');
                    }}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        watch('role') === option.value ? 'bg-primary text-white' : 'bg-gray-100',
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-base">{option.label}</span>
                      <p className="text-sm text-gray-500 mt-1">
                        {option.value === 'patient'
                          ? 'Book appointments and connect with healthcare professionals'
                          : 'Provide services and manage your practice'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {/* {errors.role && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.role.message}
              </p>
            )} */}
          </div>
        );

      case 6:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Create your account</h3>
              <p className="text-sm text-gray-600">Choose how you want to sign up</p>
            </div>

            <div className="space-y-4">
              {/* OAuth Option */}
              <Button
                variant="outline"
                onClick={() => handleAuthMethodSelect('oauth')}
                className={cn(
                  'w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm',
                  authMethod === 'oauth'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                )}
              >
                <Chrome className="h-5 w-5" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-500 font-medium">or</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </div>

              {/* Email Option */}
              <Button
                variant="outline"
                onClick={() => handleAuthMethodSelect('email')}
                className={cn(
                  'w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm',
                  authMethod === 'email'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                )}
              >
                <Mail className="h-5 w-5" />
                Continue with Email
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Create your account</h3>
              <p className="text-sm text-gray-600">Enter your email and create a secure password</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  className={cn(
                    'w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-base shadow-sm',
                    errors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary',
                  )}
                  placeholder="Enter your email address"
                  onBlur={(e) => {
                    const email = e.target.value;
                    if (email && email.includes('@') && email.includes('.') && email.length > 5) {
                      trigger('email');
                    }
                  }}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
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
                    className={cn(
                      'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm shadow-sm',
                      errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-primary',
                    )}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* {errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )} */}
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={cn(
                      'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm shadow-sm',
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-primary',
                    )}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* {errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.confirmPassword.message}
                  </p>
                )} */}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Progress Bar */}
      <div className="space-y-3 mb-4 px-2">
        {/* Mobile Progress Bar */}
        <div className="block sm:hidden">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-1">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 shadow-sm',
                      currentStep > step.id
                        ? 'bg-primary text-white'
                        : currentStep === step.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500',
                    )}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-3 w-3" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-2 h-0.5 mx-0.5 transition-all duration-200 rounded-full',
                        currentStep > step.id ? 'bg-primary' : 'bg-gray-200',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Progress Bar */}
        <div className="hidden sm:block">
          <div className="flex justify-center items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 shadow-sm',
                    currentStep > step.id
                      ? 'bg-primary text-white'
                      : currentStep === step.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {currentStep > step.id ? <CheckCircle className="h-3 w-3" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-4 h-0.5 mx-1 transition-all duration-200 rounded-full',
                      currentStep > step.id ? 'bg-primary' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">
            Step {currentStep} of {steps.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-3 px-4 mt-4">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : prevStep}
          className="h-10 px-3 sm:px-4 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">
            {currentStep === 1 ? 'Back to Login' : 'Previous'}
          </span>
          <span className="sm:hidden">{currentStep === 1 ? 'Back' : 'Prev'}</span>
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="h-10 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            <span className="hidden sm:inline">
              {currentStep === 6 && authMethod === 'oauth' ? 'Continue with Google' : 'Continue'}
            </span>
            <span className="sm:hidden">
              {currentStep === 6 && authMethod === 'oauth' ? 'Google' : 'Next'}
            </span>
            {currentStep !== 6 || authMethod !== 'oauth' ? (
              <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
            ) : null}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="h-10 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
            isLoading={isLoading}
          >
            <span className="hidden sm:inline">Complete Signup</span>
            <span className="sm:hidden">Complete</span>
          </Button>
        )}
      </div>
    </div>
  );
}
