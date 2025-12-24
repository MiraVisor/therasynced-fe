'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BACKEND_URL } from '@/services/endpoints';
import { useSignupUIStore } from '@/stores/signupUIStore';

import { AccountSetupStep } from './steps/AccountSetupStep';
import { ClinicAddressStep } from './steps/ClinicAddressStep';
import { ConsentStep } from './steps/ConsentStep';
import { JobTitleStep } from './steps/JobTitleStep';
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';

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
    termsConsent: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
    privacyConsent: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Privacy Policy',
    }),
    gdprConsent: z.boolean().refine((val) => val === true, {
      message: 'You must consent to GDPR data processing',
    }),
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

export type SignupFormData = z.infer<typeof signupSchema>;

interface MultiStepSignupProps {
  onBack: () => void;
  onSubmit: (data: Omit<SignupFormData, 'dob' | 'confirmPassword'> & { dob?: string }) => void;
  isLoading?: boolean;
}

export default function MultiStepSignup({ onBack, onSubmit, isLoading }: MultiStepSignupProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Use signup UI store for UI state
  const { authMethod, setIsGoogleLoading, setAuthMethod: _setAuthMethod } = useSignupUIStore();

  const formMethods = useForm<SignupFormData>({
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
      termsConsent: false,
      privacyConsent: false,
      gdprConsent: false,
    },
    mode: 'onChange',
  });

  const {
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = formMethods;

  const selectedRole = watch('role');

  // Simplified steps - combined for minimal flow
  const getSteps = () => {
    if (selectedRole === 'patient') {
      return [
        { id: 1, title: 'Role' },
        { id: 2, title: 'Account & Details' },
        { id: 3, title: 'Consent & Agreements' },
      ];
    } else if (selectedRole === 'freelancer') {
      return [
        { id: 1, title: 'Role' },
        { id: 2, title: 'Account & Details' },
        { id: 3, title: 'Professional Info' },
        { id: 4, title: 'Consent & Agreements' },
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
        // Professional info for freelancer, or consent for patient
        if (selectedRole === 'freelancer') {
          return await trigger('mainJobTitleId');
        } else if (selectedRole === 'patient') {
          return await trigger(['termsConsent', 'privacyConsent', 'gdprConsent']);
        }
        return true;
      case 4:
        // Consent step for freelancer
        if (selectedRole === 'freelancer') {
          return await trigger(['termsConsent', 'privacyConsent', 'gdprConsent']);
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
      _setAuthMethod(null);
    }

    // Handle OAuth - on step 2
    if (currentStep === 2 && authMethod === 'oauth') {
      handleGoogleSignUp();
      return;
    }

    // Handle completion
    if (selectedRole === 'patient' && currentStep === 3) {
      handleSubmit();
      return;
    }

    if (selectedRole === 'freelancer' && currentStep === 4) {
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
        _setAuthMethod(null);
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
      termsConsent: formValues.termsConsent,
      privacyConsent: formValues.privacyConsent,
      gdprConsent: formValues.gdprConsent,
    };

    // Remove undefined values (but keep consent booleans)
    Object.keys(transformedData).forEach((key) => {
      if (
        transformedData[key as keyof typeof transformedData] === undefined &&
        !['termsConsent', 'privacyConsent', 'gdprConsent'].includes(key)
      ) {
        delete transformedData[key as keyof typeof transformedData];
      }
    });

    onSubmit(transformedData);
  };

  // Add this helper function before isStepValid
  const areConsentsValid = (): boolean => {
    return (
      getValues('termsConsent') === true &&
      getValues('privacyConsent') === true &&
      getValues('gdprConsent') === true &&
      !errors.termsConsent &&
      !errors.privacyConsent &&
      !errors.gdprConsent
    );
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
        if (selectedRole === 'freelancer') {
          return !!getValues('mainJobTitleId') && !errors.mainJobTitleId;
        } else if (selectedRole === 'patient') {
          return (
            getValues('termsConsent') === true &&
            getValues('privacyConsent') === true &&
            getValues('gdprConsent') === true &&
            !errors.termsConsent &&
            !errors.privacyConsent &&
            !errors.gdprConsent
          );
        }
        return true;
      case 4:
        // Job title for freelancer OR Consent for patient
        if (selectedRole === 'freelancer') {
          return !!getValues('mainJobTitleId') && !errors.mainJobTitleId;
        } else if (selectedRole === 'patient') {
          // Consent step for patient
          return areConsentsValid();
        }
        return true;
      case 5:
        // Clinic address for freelancer (optional)
        // Always allow proceeding from this step since clinic address is optional
        return true;
      case 6:
        // Consent step for freelancer
        if (selectedRole === 'freelancer') {
          return areConsentsValid();
        }
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RoleSelectionStep />;

      case 2:
        return <AccountSetupStep />;

      case 3:
        return <PersonalDetailsStep />;

      case 4:
        // Job title for freelancer OR Consent for patient
        if (selectedRole === 'freelancer') {
          return <JobTitleStep />;
        } else if (selectedRole === 'patient') {
          return <ConsentStep />;
        }
        return null;

      case 5:
        return <ClinicAddressStep />;

      case 6:
        // Consent step for freelancer
        if (selectedRole === 'freelancer') {
          return <ConsentStep />;
        }
        return null;

      default:
        return null;
    }
  };

  // Only show step indicator after role selection (step 1)
  const showStepIndicator = currentStep > 1;
  const displayStep = currentStep - 1; // Step number to display (starts from 1 after role selection)
  const totalSteps = selectedRole === 'patient' ? 3 : selectedRole === 'freelancer' ? 5 : 2; // Total steps after role selection (account setup + personal details + job title + clinic address + consent for freelancer)
  const stepsToShow = steps.filter((step) => step.id > 1); // Steps to show in progress bar (exclude role selection)

  return (
    <FormProvider {...formMethods}>
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
    </FormProvider>
  );
}
