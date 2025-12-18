'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Chrome,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getActiveJobTitles } from '@/redux/api/jobTitleApi';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { BACKEND_URL } from '@/services/endpoints';
import { JobTitle } from '@/types/types';

// Define options locally
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const roleOptions = [
  {
    value: 'patient',
    label: 'Patient',
    description: 'Book appointments and manage your health records',
    icon: User,
  },
  {
    value: 'freelancer',
    label: 'Freelancer',
    description: 'Provide services and manage your practice',
    icon: Briefcase,
  },
];

// Updated Zod schema with genderOther field
const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    dob: z
      .date()
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          const today = new Date();
          const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          return date <= minAge;
        },
        { message: 'You must be at least 18 years old' },
      ),
    gender: z.string().optional(),
    genderOther: z.string().optional(), // Free text for "Other" gender
    city: z.string().optional(),
    role: z.string().min(1, 'Role is required'),
    clinicAddress: z.string().optional(),
    mainJobTitleId: z.string().optional(),
  })
  .refine(
    (data) => {
      // Job title required for freelancers
      if (data.role === 'freelancer' && !data.mainJobTitleId) {
        return false;
      }
      return true;
    },
    {
      message: 'Job title is required for freelancers',
      path: ['mainJobTitleId'],
    },
  )
  .refine((data) => {
    // Password only required if not OAuth
    if (!data.password && !data.email?.includes('@oauth')) {
      return false;
    }
    return true;
  }, 'Password is required')
  .refine(
    (data) => {
      // Password must be at least 8 characters (consistent with login)
      if (data.password && data.password.length < 8) {
        return false;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data) => {
      // If gender is "other", genderOther should be provided
      if (data.gender === 'other' && (!data.genderOther || data.genderOther.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify your gender identity',
      path: ['genderOther'],
    },
  );

type SignupFormData = z.infer<typeof signupSchema>;

interface MultiStepSignupProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function MultiStepSignup({ onBack, onSubmit, isLoading }: MultiStepSignupProps) {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'oauth' | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoadingJobTitles, setIsLoadingJobTitles] = useState(false);

  const {
    register,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: undefined,
      gender: '',
      genderOther: '',
      city: '',
      role: '',
      clinicAddress: '',
      mainJobTitleId: '',
    },
    mode: 'onChange',
  });

  const selectedRole = watch('role');
  const selectedDob = watch('dob');
  const selectedJobTitleId = watch('mainJobTitleId');
  const selectedGender = watch('gender');

  // Load job titles when role is freelancer
  useEffect(() => {
    if (selectedRole === 'freelancer' && jobTitles.length === 0) {
      loadJobTitles();
    }
  }, [selectedRole]);

  // Reset genderOther when gender changes away from "other"
  useEffect(() => {
    if (selectedGender !== 'other') {
      setValue('genderOther', '');
    }
  }, [selectedGender, setValue]);

  const loadJobTitles = async () => {
    try {
      setIsLoadingJobTitles(true);
      const response = await dispatch(getActiveJobTitles() as any);

      if (response.type?.endsWith('/fulfilled')) {
        if (Array.isArray(response.payload)) {
          setJobTitles(response.payload);
        } else {
          setJobTitles([]);
        }
      } else if (response.type?.endsWith('/rejected')) {
        console.error('Failed to load job titles:', response.payload || response.error);
        toast.error('Failed to load job titles');
        setJobTitles([]);
      } else if (response.payload && Array.isArray(response.payload)) {
        setJobTitles(response.payload);
      } else {
        setJobTitles([]);
      }
    } catch (error) {
      console.error('Failed to load job titles:', error);
      toast.error('Failed to load job titles');
      setJobTitles([]);
    } finally {
      setIsLoadingJobTitles(false);
    }
  };

  // Simplified steps - combined for minimal flow
  const getSteps = () => {
    if (selectedRole === 'patient') {
      return [
        { id: 1, title: 'Role' },
        { id: 2, title: 'Account & Details' },
      ];
    } else if (selectedRole === 'freelancer') {
      return [
        { id: 1, title: 'Role' },
        { id: 2, title: 'Account & Details' },
        { id: 3, title: 'Professional Info' },
      ];
    }
    return [{ id: 1, title: 'Role' }];
  };

  const steps = getSteps();

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger('role');
      case 2:
        // Combined account + personal details
        if (authMethod === 'email') {
          return await trigger([
            'name',
            'email',
            'password',
            'confirmPassword',
            'dob',
            'gender',
            'genderOther',
          ]);
        }
        // For OAuth, validate name, email, and dob
        return await trigger(['name', 'email', 'dob', 'gender', 'genderOther']);
      case 3:
        // Professional info for freelancer
        if (selectedRole === 'freelancer') {
          return await trigger('mainJobTitleId');
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // When moving from step 1 to step 2, reset authMethod
    if (currentStep === 1) {
      setAuthMethod(null);
    }

    // Handle OAuth - on step 2
    if (currentStep === 2 && authMethod === 'oauth') {
      handleGoogleSignUp();
      return;
    }

    // Handle completion
    if (selectedRole === 'patient' && currentStep === 2) {
      handleSubmit();
      return;
    }

    if (selectedRole === 'freelancer' && currentStep === 3) {
      handleSubmit();
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // If on step 2 and authMethod is set, reset authMethod
      if (currentStep === 2 && authMethod !== null) {
        setAuthMethod(null);
        return;
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      const googleAuthUrl = `${BACKEND_URL || 'http://localhost:4000'}/auth/google?returnUrl=${encodeURIComponent(currentUrl)}&signup=true`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error('Failed to initiate Google sign-up');
    }
  };

  const handleLocationPermission = async () => {
    setIsRequestingLocation(true);
    try {
      if (!('geolocation' in navigator)) {
        toast.error('Geolocation is not supported by your browser');
        setIsRequestingLocation(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
        );
        const data = await response.json();
        if (data.city) {
          setValue('city', data.city);
          setLocationPermissionGranted(true);
          toast.success(`Location found: ${data.city}`);
        } else {
          toast.warn('Could not determine your city. Please select manually.');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.warn('Failed to get city name. Please select manually.');
      }
    } catch (error: any) {
      const errorCode = error?.code;
      if (errorCode === 1) {
        toast.info('Location access denied. Please select your city manually.');
      } else if (errorCode === 2) {
        toast.warn('Location unavailable. Please select manually.');
      } else if (errorCode === 3) {
        toast.warn('Location request timed out. Please select manually.');
      } else {
        toast.warn('Unable to get location. Please select manually.');
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSubmit = () => {
    const formValues = getValues();

    // Handle gender - use genderOther if gender is "other"
    const finalGender =
      formValues.gender === 'other' && formValues.genderOther
        ? formValues.genderOther.trim()
        : formValues.gender || undefined;

    const transformedData = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password || undefined,
      role: formValues.role.toUpperCase(),
      dob: formValues.dob ? format(formValues.dob, 'yyyy-MM-dd') : undefined,
      gender: finalGender,
      city: formValues.city || undefined,
      clinicAddress:
        selectedRole === 'freelancer' ? formValues.clinicAddress || undefined : undefined,
      mainJobTitleId:
        selectedRole === 'freelancer' ? formValues.mainJobTitleId || undefined : undefined,
    };

    // Remove undefined values
    Object.keys(transformedData).forEach((key) => {
      if (transformedData[key as keyof typeof transformedData] === undefined) {
        delete transformedData[key as keyof typeof transformedData];
      }
    });

    onSubmit(transformedData);
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!getValues('role') && !errors.role;
      case 2:
        const name = getValues('name');
        const email = getValues('email');
        const password = getValues('password');
        const dob = getValues('dob');
        const gender = getValues('gender');
        const genderOther = getValues('genderOther');

        const hasValidName = !!name && name.length >= 2 && !errors.name;
        const hasValidEmail = !!email && email.includes('@') && !errors.email;
        const hasValidPassword = authMethod === 'oauth' || (!!password && !errors.password);
        const hasValidDob = !!dob && !errors.dob;
        const hasValidGender =
          gender !== 'other' || (!!genderOther && genderOther.trim().length > 0);

        return hasValidName && hasValidEmail && hasValidPassword && hasValidDob && hasValidGender;
      case 3:
        return !!getValues('mainJobTitleId') && !errors.mainJobTitleId;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Role Selection
        return (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-poppins font-bold text-charcoal">Get Started</h2>
              <p className="text-sm font-inter text-gray-600">
                Choose how you&apos;ll use TheraSynced
              </p>
            </div>

            <div className="space-y-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group',
                      selectedRole === option.value
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white',
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                          selectedRole === option.value
                            ? 'border-primary bg-primary'
                            : 'border-gray-300 group-hover:border-gray-400',
                        )}
                      >
                        {selectedRole === option.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      {...register('role')}
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            selectedRole === option.value ? 'text-primary' : 'text-gray-400',
                          )}
                        />
                        <div className="font-inter font-semibold text-charcoal text-base">
                          {option.label}
                        </div>
                      </div>
                      <div className="text-sm font-inter text-gray-600 ml-8">
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-red-500 text-sm font-inter mt-2 text-center" role="alert">
                {errors.role.message}
              </p>
            )}
          </div>
        );

      case 2:
        // Combined Account Setup + Personal Details
        return (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-poppins font-bold text-charcoal">
                {authMethod === 'email' ? 'Create Your Account' : 'Choose Signup Method'}
              </h2>
              <p className="text-sm font-inter text-gray-600">
                {authMethod === 'email'
                  ? 'Enter your details to get started'
                  : 'Select how you&apos;d like to sign up'}
              </p>
            </div>

            {/* Method Selection */}
            {!authMethod && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuthMethod('oauth');
                    handleGoogleSignUp();
                  }}
                  disabled={isGoogleLoading}
                  className={cn(
                    'w-full h-14 flex items-center justify-center gap-3 px-6 rounded-xl border-2 transition-all duration-200 text-base font-inter font-medium shadow-sm',
                    'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white',
                    isGoogleLoading && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <Chrome className="h-5 w-5" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500 font-inter bg-white">or</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setAuthMethod('email')}
                  className={cn(
                    'w-full h-14 flex items-center justify-center gap-3 px-6 rounded-xl border-2 transition-all duration-200 text-base font-inter font-medium shadow-sm',
                    'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white',
                  )}
                >
                  <Mail className="h-5 w-5" />
                  <span>Continue with Email</span>
                </Button>
              </div>
            )}

            {/* Email Entry Form + Personal Details Combined */}
            {authMethod === 'email' && (
              <div className="space-y-5">
                {/* Account Section */}
                <div className="space-y-4 pb-4 border-b border-gray-100">
                  <h3 className="text-sm font-inter font-semibold text-gray-700 uppercase tracking-wide">
                    Account Information
                  </h3>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-inter font-semibold text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      id="name"
                      className={cn(
                        'w-full h-12 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                        errors.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-200 focus:border-primary',
                      )}
                      placeholder="Enter your full name"
                      autoFocus
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-inter font-semibold text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      id="email"
                      className={cn(
                        'w-full h-12 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                        errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-200 focus:border-primary',
                      )}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className={cn(
                          'w-full h-12 px-4 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                          errors.password
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-200 focus:border-primary',
                        )}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm font-inter mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className={cn(
                          'w-full h-12 px-4 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                          errors.confirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-200 focus:border-primary',
                        )}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm font-inter mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-inter font-semibold text-gray-700 uppercase tracking-wide">
                    Personal Details
                  </h3>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-inter font-semibold text-gray-700">
                      Date of Birth
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full h-12 justify-start text-left font-normal border-2',
                            !selectedDob && 'text-gray-400',
                            selectedDob && 'text-charcoal',
                            errors.dob
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary',
                          )}
                          id="dob"
                        >
                          {selectedDob ? (
                            format(selectedDob, 'PPP')
                          ) : (
                            <span>Select your date of birth</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDob}
                          onSelect={(date) => {
                            if (date) {
                              const today = new Date();
                              const minAge = new Date(
                                today.getFullYear() - 18,
                                today.getMonth(),
                                today.getDate(),
                              );
                              if (date > minAge) {
                                toast.error('You must be at least 18 years old');
                                return;
                              }
                              setValue('dob', date, { shouldValidate: true });
                            } else {
                              setValue('dob', undefined, { shouldValidate: true });
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const minAge = new Date(
                              today.getFullYear() - 18,
                              today.getMonth(),
                              today.getDate(),
                            );
                            return date > minAge || date > today;
                          }}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dob && (
                      <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>

                  {/* Gender Field with "Other" text input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="gender"
                      className="text-sm font-inter font-semibold text-gray-700"
                    >
                      Gender
                    </label>
                    <Select
                      value={watch('gender') || ''}
                      onValueChange={(value) => {
                        setValue('gender', value);
                        if (value !== 'other') {
                          setValue('genderOther', '');
                        }
                        trigger('gender');
                      }}
                    >
                      <SelectTrigger
                        id="gender"
                        className={cn(
                          'w-full h-12 font-inter text-sm border-2',
                          errors.gender
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-primary',
                        )}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="font-inter"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Show text input when "Other" is selected */}
                    {selectedGender === 'other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register('genderOther')}
                          className={cn(
                            'w-full h-12 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                            errors.genderOther
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-gray-200 focus:border-primary',
                          )}
                          placeholder="Please specify your gender identity"
                          autoFocus
                        />
                        {errors.genderOther && (
                          <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                            {errors.genderOther.message}
                          </p>
                        )}
                      </div>
                    )}

                    {errors.gender && selectedGender !== 'other' && (
                      <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* City Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-gray-700">City</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <LocationDropdown
                          value={watch('city') || ''}
                          onValueChange={(value) => setValue('city', value)}
                          placeholder="Select your city"
                          searchPlaceholder="Search locations..."
                          emptyMessage="No location found."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocationPermission}
                        disabled={isRequestingLocation || locationPermissionGranted}
                        className="h-12 px-4 border-2 border-gray-200 hover:border-gray-300"
                        title="Get location automatically"
                      >
                        {isRequestingLocation ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <MapPin className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OAuth Pre-filled Info */}
            {authMethod === 'oauth' && watch('name') && (
              <div className="space-y-4">
                <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-sm font-inter text-gray-700 font-medium">
                    We&apos;ll use the following information from your Google account:
                  </p>
                  <div className="space-y-2">
                    <p className="text-base font-inter font-semibold text-charcoal">
                      Name: {watch('name')}
                    </p>
                    <p className="text-base font-inter font-semibold text-charcoal">
                      Email: {watch('email')}
                    </p>
                  </div>
                </div>

                {/* Personal Details for OAuth */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-inter font-semibold text-gray-700 uppercase tracking-wide">
                    Personal Details
                  </h3>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label
                      htmlFor="dob-oauth"
                      className="text-sm font-inter font-semibold text-gray-700"
                    >
                      Date of Birth
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full h-12 justify-start text-left font-normal border-2',
                            !selectedDob && 'text-gray-400',
                            selectedDob && 'text-charcoal',
                            errors.dob
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary',
                          )}
                          id="dob-oauth"
                        >
                          {selectedDob ? (
                            format(selectedDob, 'PPP')
                          ) : (
                            <span>Select your date of birth</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDob}
                          onSelect={(date) => {
                            if (date) {
                              const today = new Date();
                              const minAge = new Date(
                                today.getFullYear() - 18,
                                today.getMonth(),
                                today.getDate(),
                              );
                              if (date > minAge) {
                                toast.error('You must be at least 18 years old');
                                return;
                              }
                              setValue('dob', date, { shouldValidate: true });
                            } else {
                              setValue('dob', undefined, { shouldValidate: true });
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const minAge = new Date(
                              today.getFullYear() - 18,
                              today.getMonth(),
                              today.getDate(),
                            );
                            return date > minAge || date > today;
                          }}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dob && (
                      <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>

                  {/* Gender Field with "Other" text input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="gender-oauth"
                      className="text-sm font-inter font-semibold text-gray-700"
                    >
                      Gender
                    </label>
                    <Select
                      value={watch('gender') || ''}
                      onValueChange={(value) => {
                        setValue('gender', value);
                        if (value !== 'other') {
                          setValue('genderOther', '');
                        }
                        trigger('gender');
                      }}
                    >
                      <SelectTrigger
                        id="gender-oauth"
                        className={cn(
                          'w-full h-12 font-inter text-sm border-2',
                          errors.gender
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-primary',
                        )}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="font-inter"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Show text input when "Other" is selected */}
                    {selectedGender === 'other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          {...register('genderOther')}
                          className={cn(
                            'w-full h-12 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                            errors.genderOther
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-gray-200 focus:border-primary',
                          )}
                          placeholder="Please specify your gender identity"
                          autoFocus
                        />
                        {errors.genderOther && (
                          <p className="text-red-500 text-sm font-inter mt-1" role="alert">
                            {errors.genderOther.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* City Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-semibold text-gray-700">City</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <LocationDropdown
                          value={watch('city') || ''}
                          onValueChange={(value) => setValue('city', value)}
                          placeholder="Select your city"
                          searchPlaceholder="Search locations..."
                          emptyMessage="No location found."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocationPermission}
                        disabled={isRequestingLocation || locationPermissionGranted}
                        className="h-12 px-4 border-2 border-gray-200 hover:border-gray-300"
                        title="Get location automatically"
                      >
                        {isRequestingLocation ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <MapPin className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        // Professional Info (Freelancer only) - Combined Job Title + Clinic Address
        return (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-poppins font-bold text-charcoal">
                Professional Information
              </h2>
              <p className="text-sm font-inter text-gray-600">Tell us about your profession</p>
            </div>

            <div className="space-y-5">
              {/* Job Title */}
              <div className="space-y-2">
                <label
                  className="text-sm font-inter font-semibold text-gray-700"
                  htmlFor="mainJobTitleId"
                >
                  Job Title
                </label>
                <Select
                  value={selectedJobTitleId || ''}
                  onValueChange={(value) => {
                    setValue('mainJobTitleId', value, { shouldValidate: true });
                    trigger('mainJobTitleId');
                  }}
                  disabled={isLoadingJobTitles}
                >
                  <SelectTrigger
                    id="mainJobTitleId"
                    className={cn(
                      'w-full h-12 font-inter text-sm border-2',
                      errors.mainJobTitleId
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary',
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingJobTitles
                          ? 'Loading job titles...'
                          : jobTitles.length === 0
                            ? 'No job titles available'
                            : 'Select your job title'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.length === 0 ? (
                      <SelectItem value="" disabled>
                        {isLoadingJobTitles ? 'Loading...' : 'No job titles available'}
                      </SelectItem>
                    ) : (
                      jobTitles.map((jobTitle) => (
                        <SelectItem key={jobTitle.id} value={jobTitle.id} className="font-inter">
                          <div>
                            <span className="text-sm font-medium">{jobTitle.name}</span>
                            {jobTitle.description && (
                              <span className="text-xs text-gray-500 block">
                                {jobTitle.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.mainJobTitleId && (
                  <p
                    id="jobTitle-error"
                    className="text-red-500 text-sm font-inter mt-1"
                    role="alert"
                  >
                    {errors.mainJobTitleId.message}
                  </p>
                )}
              </div>

              {/* Clinic Address */}
              <div className="space-y-2">
                <label
                  className="text-sm font-inter font-semibold text-gray-700"
                  htmlFor="clinicAddress"
                >
                  Clinic Address <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  {...register('clinicAddress', {
                    validate: (value) => {
                      if (!value || value.trim().length === 0) {
                        return true;
                      }
                      if (value.trim().length < 5) {
                        return 'Address must be at least 5 characters';
                      }
                      return true;
                    },
                  })}
                  id="clinicAddress"
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter resize-none',
                    errors.clinicAddress
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-primary',
                  )}
                  placeholder="Enter your clinic address (optional)"
                />
                {errors.clinicAddress && (
                  <p
                    id="clinicAddress-error"
                    className="text-red-500 text-sm font-inter mt-1"
                    role="alert"
                  >
                    {errors.clinicAddress.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate progress
  const totalSteps = selectedRole === 'patient' ? 2 : selectedRole === 'freelancer' ? 3 : 1;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Minimal Progress Bar - Only show after role selection */}
      {selectedRole && currentStep > 1 && (
        <div className="flex-shrink-0 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wide">
              {steps.find((s) => s.id === currentStep)?.title}
            </span>
            <span className="text-xs font-inter font-medium text-gray-500">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center min-h-[400px] pb-6">
        <div className="w-full max-w-md">{renderStepContent()}</div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0 pt-6 border-t border-gray-100">
        <div
          className={cn(
            'flex gap-3',
            currentStep === 2 && authMethod === null ? 'justify-start' : 'justify-between',
          )}
        >
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? onBack : prevStep}
            className="h-11 px-5 rounded-lg transition-all duration-200 font-inter font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            <span>{currentStep === 1 ? 'Back' : 'Previous'}</span>
          </Button>

          {/* Hide Continue button on step 2 when method selection is shown */}
          {!(currentStep === 2 && authMethod === null) && (
            <>
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="h-11 px-6 rounded-lg font-inter font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm ml-auto"
                >
                  <span>Next Step</span>
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="h-11 px-6 rounded-lg font-inter font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm ml-auto"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Complete Signup'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
