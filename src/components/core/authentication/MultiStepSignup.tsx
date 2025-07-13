'use client';

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Chrome,
  FileText,
  Github,
  Shield,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { DatePicker } from '@/components/common/input/DatePicker';
import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { genderOptions, roleOptions } from '@/config/onboardingConfig';
import { cn } from '@/lib/utils';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: '',
    city: '',
    role: 'patient',
    email: '',
    password: '',
    confirmPassword: '',
    documents: [] as File[],
    portfolio: '',
    experience: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

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
          formData.firstName &&
          formData.lastName &&
          formData.gender &&
          formData.dob &&
          formData.city
        );
      case 2:
        return formData.role;
      case 3:
        return (
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      case 4:
        return formData.role !== 'freelancer' || formData.documents.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const transformedData = {
      ...formData,
      role: formData.role.toUpperCase(),
    };
    onSubmit(transformedData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your last name"
                />
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
                        formData.gender === option.value
                          ? 'border-primary bg-white text-black shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5',
                      )}
                      onClick={() => handleChange('gender', option.value)}
                    >
                      <IconComponent className="h-4 w-4 mb-1" />
                      <span className="text-xs font-medium text-center">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <DatePicker
              title="Date of Birth"
              onChange={(date) => handleChange('dob', date?.toISOString() ?? '')}
            />

            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Location
              </label>
              <LocationDropdown
                value={formData.city}
                onValueChange={(value) => handleChange('city', value)}
                placeholder="Type or select your city, town, or village"
                searchPlaceholder="Search locations..."
                emptyMessage="No location found."
              />
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
                      formData.role === option.value
                        ? 'border-primary bg-white text-black shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5',
                    )}
                    onClick={() => handleChange('role', option.value)}
                  >
                    <IconComponent className="h-5 w-5 mb-2" />
                    <span className="text-xs font-medium text-center">{option.label}</span>
                  </label>
                );
              })}
            </div>
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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a strong password"
                />
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* <div className="bg-secondary p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Account Summary</h4>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
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
        if (formData.role !== 'freelancer') {
          return (
            <div className="text-center py-6">
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-2" />
              <h3 className="text-base font-semibold mb-1">You&apos;re all set!</h3>
              <p className="text-sm text-gray-600">
                No additional documents required for your role.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-gray-500 mb-2">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg border-gray-200 hover:bg-gray-50 text-sm"
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {formData.documents.length > 0 && (
              <div className="space-y-1">
                <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                  Uploaded Files
                </label>
                <div className="space-y-1">
                  {formData.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Portfolio URL (Optional)
              </label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => handleChange('portfolio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div className="space-y-1">
              <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
                Years of Experience
              </label>
              <select
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
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
            {JSON.stringify({ ...formData, currentStep }, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
