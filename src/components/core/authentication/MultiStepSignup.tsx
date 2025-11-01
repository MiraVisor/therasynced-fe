'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ChevronLeft, ChevronRight, Chrome, Eye, EyeOff, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { JobTitle } from '@/types/types';

// Define options locally since onboarding config is removed
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const roleOptions = [
  { value: 'patient', label: 'Patient' },
  { value: 'freelancer', label: 'Freelancer' },
];

// Simplified Zod schema for form validation
const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.string().min(1, 'Role is required'),
    mainJobTitleId: z.string().optional(),
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
  { id: 1, title: 'Account', description: 'Create your account' },
  { id: 2, title: 'Role', description: "How you'll use the platform" },
  { id: 3, title: 'Job Title', description: 'Select your specialization' },
];

export default function MultiStepSignup({ onBack, onSubmit, isLoading }: MultiStepSignupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'oauth' | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoadingJobTitles, setIsLoadingJobTitles] = useState(false);

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
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    mode: 'onChange',
  });

  // Trigger validation when step changes to ensure existing values are validated
  useEffect(() => {
    const validateCurrentStepFields = async () => {
      switch (currentStep) {
        case 1:
          await trigger(['name', 'email', 'password', 'confirmPassword']);
          break;
        case 2:
          await trigger('role');
          break;
        case 3:
          await trigger('mainJobTitleId');
          break;
      }
    };

    validateCurrentStepFields();
  }, [currentStep, trigger]);

  // Fetch job titles when on step 3 and role is freelancer
  useEffect(() => {
    const loadJobTitles = async () => {
      const role = getValues('role');
      if (currentStep === 3 && role === 'freelancer' && jobTitles.length === 0) {
        setIsLoadingJobTitles(true);
        try {
          const response = await api.get(ENDPOINTS.public.jobTitles);
          if (response.data.success && Array.isArray(response.data.data)) {
            setJobTitles(response.data.data);
          }
        } catch (error) {
          toast.error('Failed to load job titles');
        } finally {
          setIsLoadingJobTitles(false);
        }
      }
    };

    loadJobTitles();
  }, [currentStep]);

  const nextStep = async () => {
    if (currentStep === 1 && authMethod === 'oauth') {
      // Handle OAuth signup
      handleOAuthSignup('google');
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Special handling for step 2 -> 3: Skip job title for patients
    if (currentStep === 2) {
      const role = getValues('role');
      if (role === 'patient') {
        // Patients don't need job title, go directly to submit
        handleSubmit();
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await trigger(['name', 'email', 'password', 'confirmPassword']);
      case 2:
        return await trigger('role');
      case 3:
        const role = getValues('role');
        if (role === 'freelancer') {
          return await trigger('mainJobTitleId');
        }
        return true; // Skip job title for patients
      default:
        return false;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        const name = getValues('name');
        const email = getValues('email');
        const password = getValues('password');
        const confirmPassword = getValues('confirmPassword');
        return (
          name &&
          name.length >= 2 &&
          !errors.name &&
          email &&
          email.includes('@') &&
          !errors.email &&
          password &&
          password.length >= 8 &&
          !errors.password &&
          confirmPassword &&
          password === confirmPassword &&
          !errors.confirmPassword
        );
      case 2:
        const role = getValues('role');
        return role && !errors.role;
      case 3:
        const selectedRole = getValues('role');
        if (selectedRole === 'freelancer') {
          const jobTitleId = getValues('mainJobTitleId');
          return jobTitleId && !errors.mainJobTitleId;
        }
        return true; // Skip job title for patients
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
      // Only include job title if it's for a freelancer
      mainJobTitleId: submitData.mainJobTitleId || undefined,
    };
    onSubmit(transformedData);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      // Get the current URL to use as return URL
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

      // Construct the Google OAuth URL with return URL (matching GoogleSignInButton implementation)
      const backendUrl = BACKEND_URL || 'http://localhost:4000';
      const googleAuthUrl = `${backendUrl}/auth/google?returnUrl=${encodeURIComponent(currentUrl)}`;

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error('Failed to initiate Google sign-in');
    }
  };

  const handleOAuthSignup = (provider: string) => {
    if (provider === 'google') {
      handleGoogleSignIn();
    }
  };

  const handleAuthMethodSelect = (method: 'email' | 'oauth') => {
    setAuthMethod(method);
    if (method === 'oauth') {
      // For OAuth, we can proceed directly or handle it differently
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Create your account</h3>
              <p className="text-sm text-gray-600">Enter your details to get started</p>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
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
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
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
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={cn(
                      'w-full h-12 px-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-base shadow-sm',
                      errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-primary',
                    )}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={cn(
                      'w-full h-12 px-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-base shadow-sm',
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-primary',
                    )}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
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
                      <span className="text-lg">{option.value === 'patient' ? '👤' : '💼'}</span>
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

            {/* OAuth Options */}
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-500 font-medium">or</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </div>

              {/* Google OAuth */}
              <Button
                variant="outline"
                onClick={() => handleAuthMethodSelect('oauth')}
                disabled={isGoogleLoading}
                className={cn(
                  'w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm',
                  authMethod === 'oauth'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                  isGoogleLoading && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 3:
        const selectedRole = getValues('role');
        // Only show job title for freelancers
        if (selectedRole !== 'freelancer') {
          return null;
        }

        if (isLoadingJobTitles) {
          return (
            <div className="w-full max-w-lg space-y-6 px-4 flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          );
        }

        return (
          <div className="w-full max-w-lg space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Select Your Job Title</h3>
              <p className="text-sm text-gray-600">
                Choose the job title that best describes your specialization
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobTitles.map((jobTitle) => (
                <label
                  key={jobTitle.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2',
                    watch('mainJobTitleId') === jobTitle.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-primary/30 hover:bg-primary/5',
                  )}
                  onClick={() => {
                    setValue('mainJobTitleId', jobTitle.id);
                    trigger('mainJobTitleId');
                  }}
                >
                  <div
                    className={cn(
                      'mt-0.5 w-4 h-4 border-2 rounded flex items-center justify-center',
                      watch('mainJobTitleId') === jobTitle.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300',
                    )}
                  >
                    {watch('mainJobTitleId') === jobTitle.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-base text-gray-900">{jobTitle.name}</span>
                    {jobTitle.description && (
                      <p className="text-sm text-gray-600 mt-1">{jobTitle.description}</p>
                    )}
                  </div>
                </label>
              ))}

              {jobTitles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No job titles available at the moment.
                </div>
              )}
            </div>
          </div>
        );

      // Old unused cases - kept for reference but not in the flow anymore
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
                  errors['city' as keyof typeof errors] ? 'border-red-500' : 'border-gray-200',
                )}
              >
                <LocationDropdown
                  value={watch('city' as any)}
                  onValueChange={(value) => {
                    setValue('city' as any, value);
                    trigger('city' as any);
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

      // This is the old DOB step - not in use anymore but keeping for reference
      case 999:
        return (
          <div className="w-full max-w-md space-y-6 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-900">When were you born?</h3>
              <p className="text-sm text-gray-600">You must be at least 18 years old to register</p>
            </div>

            <div className="space-y-4">
              <input
                type="date"
                value={
                  getValues('dob' as any)
                    ? (() => {
                        try {
                          return getValues('dob' as any);
                        } catch {
                          return '';
                        }
                      })()
                    : ''
                }
                className={cn(
                  'w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-base shadow-sm',
                  errors['dob' as keyof typeof errors]
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-primary',
                )}
                max={(() => {
                  const today = new Date();
                  const eighteenYearsAgo = new Date(
                    today.getFullYear() - 18,
                    today.getMonth(),
                    today.getDate(),
                  );
                  // Format as YYYY-MM-DD without timezone conversion
                  const year = eighteenYearsAgo.getFullYear();
                  const month = String(eighteenYearsAgo.getMonth() + 1).padStart(2, '0');
                  const day = String(eighteenYearsAgo.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                min="1900-01-01"
                onChange={(e) => {
                  const inputValue = e.target.value;

                  // Only process if we have a complete date (YYYY-MM-DD format)
                  if (inputValue && inputValue.length === 10 && inputValue.includes('-')) {
                    try {
                      // Validate the date format without timezone conversion
                      const dateParts = inputValue.split('-');
                      const year = parseInt(dateParts[0]);
                      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                      const day = parseInt(dateParts[2]);
                      const selectedDate = new Date(year, month, day);

                      // Check if the date is valid and matches the input
                      if (
                        !isNaN(selectedDate.getTime()) &&
                        selectedDate.getFullYear() === year &&
                        selectedDate.getMonth() === month &&
                        selectedDate.getDate() === day
                      ) {
                        // Store as YYYY-MM-DD format without timezone conversion
                        setValue('dob' as any, inputValue);
                        trigger('dob' as any);
                      }
                    } catch (error) {
                      // If date conversion fails, just clear the value
                      setValue('dob' as any, '');
                    }
                  } else if (!inputValue) {
                    // Clear the value if input is empty
                    setValue('dob' as any, '');
                    trigger('dob' as any);
                  }
                  // For incomplete dates, don't update the form value yet
                }}
                autoFocus
              />
              {errors['dob' as keyof typeof errors] && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors['dob' as keyof typeof errors]?.message}
                </p>
              )}
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
                  errors['city' as keyof typeof errors] ? 'border-red-500' : 'border-gray-200',
                )}
              >
                <LocationDropdown
                  value={watch('city' as any)}
                  onValueChange={(value) => {
                    setValue('city' as any, value);
                    trigger('city' as any);
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
                      <span className="text-lg">{option.value === 'patient' ? '👤' : '💼'}</span>
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
                disabled={isGoogleLoading}
                className={cn(
                  'w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm',
                  authMethod === 'oauth'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                  isGoogleLoading && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    Continue with Google
                  </>
                )}
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
          className="h-10 px-3 sm:px-4 rounded-lg transition-all duration-200 font-medium shadow-sm text-sm"
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
            className="h-10 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm text-sm"
          >
            <span className="hidden sm:inline">Continue</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="h-10 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm text-sm"
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
