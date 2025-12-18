'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Chrome,
  Eye,
  EyeOff,
  Mail,
  MapPin,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
  { value: 'patient', label: 'Patient' },
  { value: 'freelancer', label: 'Freelancer' },
];

// Updated Zod schema for form validation
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
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
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
  const prevStepRef = useRef(1);

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

  // Load job titles when role is freelancer
  useEffect(() => {
    if (selectedRole === 'freelancer' && jobTitles.length === 0) {
      loadJobTitles();
    }
  }, [selectedRole]);

  // Reset authMethod when navigating back to step 2 from step 3 to show selection screen
  useEffect(() => {
    if (currentStep === 2 && prevStepRef.current === 3 && authMethod !== null) {
      setAuthMethod(null);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const loadJobTitles = async () => {
    try {
      setIsLoadingJobTitles(true);
      const response = await dispatch(getActiveJobTitles() as any);

      // Handle both fulfilled and rejected responses
      if (response.type?.endsWith('/fulfilled')) {
        if (Array.isArray(response.payload)) {
          setJobTitles(response.payload);
          if (response.payload.length === 0) {
            console.warn('No job titles returned from API');
          }
        } else {
          console.error('Invalid job titles response format:', response.payload);
          setJobTitles([]);
        }
      } else if (response.type?.endsWith('/rejected')) {
        console.error('Failed to load job titles:', response.payload || response.error);
        toast.error('Failed to load job titles');
        setJobTitles([]);
      } else if (response.payload && Array.isArray(response.payload)) {
        // Fallback for direct payload
        setJobTitles(response.payload);
      } else {
        console.error('Unexpected response format:', response);
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

  // Determine steps based on role
  const getSteps = () => {
    if (selectedRole === 'patient') {
      return [
        { id: 1, title: 'Role', description: "How you'll use the platform" },
        { id: 2, title: 'Account Setup', description: 'Create your account' },
        { id: 3, title: 'Personal Details', description: 'Additional information' },
      ];
    } else if (selectedRole === 'freelancer') {
      return [
        { id: 1, title: 'Role', description: "How you'll use the platform" },
        { id: 2, title: 'Account Setup', description: 'Create your account' },
        { id: 3, title: 'Personal Details', description: 'Additional information' },
        { id: 4, title: 'Job Title', description: 'Select your profession' },
        { id: 5, title: 'Clinic Address', description: 'Add your clinic address' },
      ];
    }
    return [{ id: 1, title: 'Role', description: "How you'll use the platform" }];
  };

  const steps = getSteps();

  // Request location permission on mount
  useEffect(() => {
    const requestLocation = async () => {
      if (!('geolocation' in navigator)) {
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          });
        });

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
          );
          const data = await response.json();
          if (data.city) {
            setValue('city', data.city);
            setLocationPermissionGranted(true);
            toast.success(`Location found: ${data.city}`);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      } catch (error) {
        // User denied or error occurred
        console.log('Location permission denied or unavailable');
      }
    };

    // Don't auto-request location - user will click button to request
  }, [setValue]);

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger('role');
      case 2:
        // Account setup: name, email, password
        return await trigger(['name', 'email', 'password', 'confirmPassword']);
      case 3:
        // Personal details: DOB, gender, city
        if (authMethod === 'email') {
          return await trigger(['dob', 'gender', 'city']);
        }
        // For OAuth, only validate name and email were filled
        return await trigger(['name', 'email']);
      case 4:
        // Job title for freelancer
        if (selectedRole === 'freelancer') {
          return await trigger('mainJobTitleId');
        }
        return true;
      case 5:
        // Clinic address for freelancer (optional)
        // No validation needed since it's optional
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Handle OAuth - on step 2 (account setup)
    if (currentStep === 2 && authMethod === 'oauth') {
      handleGoogleSignUp();
      return;
    }

    // Special handling for completion
    if (selectedRole === 'patient' && currentStep === 3) {
      // Patient completes after personal details
      handleSubmit();
      return;
    }

    if (selectedRole === 'freelancer' && currentStep === 5) {
      // Freelancer completes after clinic address
      handleSubmit();
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // If on step 2 and authMethod is set, reset authMethod to show selection screen (stay on step 2)
      if (currentStep === 2 && authMethod !== null) {
        setAuthMethod(null);
        return; // Stay on step 2, just reset the auth method
      }
      // Otherwise, go to previous step normally
      const newStep = currentStep - 1;
      // If going back from step 3 to step 2, reset authMethod to show selection screen
      if (currentStep === 3 && newStep === 2) {
        setAuthMethod(null);
      }
      setCurrentStep(newStep);
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

      // Reverse geocode to get city
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
          toast.warn('Could not determine your city from location. Please select manually.');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.warn('Failed to get city name from location. Please select manually.');
      }
    } catch (error: any) {
      // Handle different geolocation error types
      const errorCode = error?.code;
      if (errorCode === 1) {
        // PERMISSION_DENIED
        toast.info('Location access was denied. Please select your city manually.');
      } else if (errorCode === 2) {
        // POSITION_UNAVAILABLE
        toast.warn('Location unavailable. Please select your city manually.');
      } else if (errorCode === 3) {
        // TIMEOUT
        toast.warn('Location request timed out. Please select your city manually.');
      } else {
        // Unknown error
        toast.warn('Unable to get your location. Please select your city manually.');
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSubmit = () => {
    const formValues = getValues();
    const transformedData = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password || undefined,
      role: formValues.role.toUpperCase(),
      dob: formValues.dob ? format(formValues.dob, 'yyyy-MM-dd') : undefined,
      gender: formValues.gender || undefined,
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
        // Account setup: name, email, password
        const name = getValues('name');
        const email = getValues('email');
        const password = getValues('password');
        return (
          !!name &&
          name.length >= 2 &&
          !errors.name &&
          !!email &&
          email.includes('@') &&
          !errors.email &&
          (authMethod === 'oauth' || (!!password && !errors.password))
        );
      case 3:
        // Personal details: DOB required, gender and city optional
        const dob = getValues('dob');
        return !!dob && !errors.dob;
      case 4:
        // Job title for freelancer (required)
        return !!getValues('mainJobTitleId') && !errors.mainJobTitleId;
      case 5:
        // Clinic address for freelancer (optional)
        // Always allow proceeding from this step since clinic address is optional
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Role Selection
        return (
          <div className="w-full space-y-2">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal">Choose Your Role</h3>
              <p className="text-xs font-inter text-gray-600">
                Select how you&apos;ll use the platform
              </p>
            </div>

            <div className="space-y-2">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition-all duration-200',
                    selectedRole === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400',
                  )}
                >
                  <input
                    type="radio"
                    {...register('role')}
                    value={option.value}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="font-inter font-semibold text-charcoal text-sm">
                      {option.label}
                    </div>
                    <div className="text-xs font-inter text-gray-600 mt-0.5">
                      {option.value === 'patient'
                        ? 'Book appointments and manage your health records'
                        : 'Provide services and manage your practice'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs font-inter mt-1">{errors.role.message}</p>
            )}
          </div>
        );

      case 2:
        // Account Setup: Authentication method + Basic info (name, email, password)
        return (
          <div className="w-full space-y-2">
            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal">
                {authMethod === 'email' ? 'Create Your Account' : 'Choose Signup Method'}
              </h3>
              <p className="text-xs font-inter text-gray-600">
                {authMethod === 'email'
                  ? 'Enter your name, email, and create a password'
                  : 'Continue with Google or use email'}
              </p>
            </div>

            {/* OAuth Option */}
            {!authMethod && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setAuthMethod('oauth')}
                  disabled={isGoogleLoading}
                  className={cn(
                    'w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-all duration-200 text-sm font-inter font-medium',
                    authMethod === 'oauth'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:bg-gray-50',
                    isGoogleLoading && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Signing up...</span>
                    </div>
                  ) : (
                    <>
                      <Chrome className="h-4 w-4" />
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative py-1">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-2 text-xs text-gray-500 font-inter">or</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setAuthMethod('email')}
                  className={cn(
                    'w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg border transition-all duration-200 text-sm font-inter font-medium',
                    authMethod === 'email'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Mail className="h-4 w-4" />
                  Continue with Email
                </Button>
              </div>
            )}

            {/* Email Entry Form */}
            {authMethod === 'email' && (
              <div className="space-y-2">
                {/* Name Field */}
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-inter font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    id="name"
                    aria-label="Full name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={cn(
                      'w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                      errors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-primary',
                    )}
                    placeholder="Enter your full name"
                    autoFocus
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="text-red-500 text-xs font-inter mt-0.5"
                      role="alert"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-inter font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    id="email"
                    aria-label="Email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={cn(
                      'w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-primary',
                    )}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-red-500 text-xs font-inter mt-0.5"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-inter font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={cn(
                        'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                        errors.password
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-primary',
                      )}
                      placeholder="Create a password"
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
                    <p className="text-red-500 text-xs font-inter mt-0.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-inter font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={cn(
                        'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
                        errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-primary',
                      )}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs font-inter mt-0.5">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* OAuth Pre-filled Info */}
            {authMethod === 'oauth' && watch('name') && (
              <div className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs font-inter text-gray-600">
                  We&apos;ll use the following information from your Google account:
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-inter font-medium text-charcoal">
                    Name: {watch('name')}
                  </p>
                  <p className="text-sm font-inter font-medium text-charcoal">
                    Email: {watch('email')}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        // Personal Details: DOB, Gender, City
        return (
          <div className="w-full space-y-2">
            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal">Personal Details</h3>
              <p className="text-xs font-inter text-gray-600">
                Share some additional information about yourself
              </p>
            </div>

            <div className="space-y-2">
              {/* Date of Birth Field */}
              <div className="space-y-1">
                <label htmlFor="dob" className="text-xs font-inter font-medium text-gray-700">
                  Date of Birth
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-10 justify-start text-left font-normal',
                        !selectedDob && 'text-muted-foreground',
                        selectedDob && 'text-charcoal',
                        errors.dob && 'border-red-500 focus:border-red-500',
                      )}
                      id="dob"
                      aria-label="Date of birth"
                      aria-invalid={!!errors.dob}
                      aria-describedby={errors.dob ? 'dob-error' : undefined}
                    >
                      {selectedDob ? format(selectedDob, 'PPP') : <span>DD/MM/YYYY</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDob}
                      onSelect={(date) => {
                        if (date) {
                          // Validate age (must be 18+)
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
                  <p id="dob-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
                    {errors.dob.message}
                  </p>
                )}
              </div>

              {/* Gender Field */}
              <div className="space-y-1">
                <label htmlFor="gender" className="text-xs font-inter font-medium text-gray-700">
                  Gender
                </label>
                <Select
                  value={watch('gender') || ''}
                  onValueChange={(value) => {
                    setValue('gender', value);
                    trigger('gender');
                  }}
                >
                  <SelectTrigger
                    id="gender"
                    aria-label="Gender"
                    aria-invalid={!!errors.gender}
                    aria-describedby={errors.gender ? 'gender-error' : undefined}
                    className={cn(
                      'w-full h-10 font-inter text-sm',
                      errors.gender && 'border-red-500 focus:border-red-500',
                    )}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="font-inter">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p
                    id="gender-error"
                    className="text-red-500 text-xs font-inter mt-0.5"
                    role="alert"
                  >
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* City Field */}
              <div className="space-y-1">
                <label className="text-xs font-inter font-medium text-gray-700">City</label>
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
                    className="h-10 px-3 border-gray-300"
                    title="Get location"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs font-inter mt-0.5">{errors.city.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        // Job Title (Freelancer only)
        return (
          <div className="w-full space-y-2">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal">Job Title</h3>
              <p className="text-xs font-inter text-gray-600">
                Select your profession or specialty
              </p>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-inter font-medium text-gray-700"
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
                  aria-label="Job title"
                  aria-invalid={!!errors.mainJobTitleId}
                  aria-describedby={errors.mainJobTitleId ? 'jobTitle-error' : undefined}
                  className={cn(
                    'w-full h-10 font-inter text-sm',
                    errors.mainJobTitleId && 'border-red-500 focus:border-red-500',
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
                  className="text-red-500 text-xs font-inter mt-0.5"
                  role="alert"
                >
                  {errors.mainJobTitleId.message}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        // Clinic Address (Freelancer only)
        return (
          <div className="w-full space-y-2">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal">Clinic Address</h3>
              <p className="text-xs font-inter text-gray-600">
                Enter your clinic address (optional)
              </p>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-inter font-medium text-gray-700"
                htmlFor="clinicAddress"
              >
                Clinic Address <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                {...register('clinicAddress', {
                  // Clinic address is optional, but if provided, it should be at least 5 characters
                  validate: (value) => {
                    if (!value || value.trim().length === 0) {
                      return true; // Empty is allowed
                    }
                    if (value.trim().length < 5) {
                      return 'Address must be at least 5 characters';
                    }
                    return true;
                  },
                })}
                id="clinicAddress"
                rows={3}
                aria-label="Clinic address"
                aria-invalid={!!errors.clinicAddress}
                aria-describedby={errors.clinicAddress ? 'clinicAddress-error' : undefined}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter resize-none',
                  errors.clinicAddress
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-primary',
                )}
                placeholder="Enter your clinic address"
              />
              {errors.clinicAddress && (
                <p
                  id="clinicAddress-error"
                  className="text-red-500 text-xs font-inter mt-0.5"
                  role="alert"
                >
                  {errors.clinicAddress.message}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Only show step indicator after role selection (step 1)
  const showStepIndicator = currentStep > 1;
  const displayStep = currentStep - 1; // Step number to display (starts from 1 after role selection)
  const totalSteps = selectedRole === 'patient' ? 2 : selectedRole === 'freelancer' ? 4 : 2; // Total steps after role selection (account setup + personal details + job title + clinic address for freelancer)
  const stepsToShow = steps.filter((step) => step.id > 1); // Steps to show in progress bar (exclude role selection)

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Progress Bar - Only show after role selection */}
      {showStepIndicator && (
        <div className="flex-shrink-0">
          <div className="flex justify-center items-center mb-2">
            <div className="flex items-center space-x-2">
              {stepsToShow.map((step, index) => {
                const stepNumber = step.id - 1;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 font-inter',
                        isCompleted
                          ? 'bg-primary text-white'
                          : isActive
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-500',
                      )}
                    >
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                    </div>
                    {index < stepsToShow.length - 1 && (
                      <div
                        className={cn(
                          'w-8 h-0.5 mx-1 transition-all duration-200',
                          isCompleted ? 'bg-primary' : 'bg-gray-200',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-inter text-gray-600 font-medium">
              Step {displayStep} of {totalSteps}
            </p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">{renderStepContent()}</div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex justify-between gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : prevStep}
          className="h-10 px-4 rounded-lg transition-all duration-200 font-inter font-medium text-sm border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          <span>{currentStep === 1 ? 'Back to Login' : 'Previous'}</span>
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="h-10 px-6 rounded-lg font-inter font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="h-10 px-6 rounded-lg font-inter font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 text-sm"
            isLoading={isLoading}
          >
            Complete Signup
          </Button>
        )}
      </div>
    </div>
  );
}
