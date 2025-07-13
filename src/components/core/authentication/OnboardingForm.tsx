'use client';

import { useState } from 'react';

import { DatePicker } from '@/components/common/input/DatePicker';
import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { genderOptions, roleOptions } from '@/config/onboardingConfig';
import { cn } from '@/lib/utils';

interface OnboardingFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function OnboardingForm({ onBack, onSubmit, isLoading }: OnboardingFormProps) {
  const [formData, setFormData] = useState({
    gender: 'male',
    dob: '',
    city: '',
    role: 'patient',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    const transformedData = {
      ...formData,
      role: formData.role.toUpperCase(),
    };
    onSubmit(transformedData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
          Gender
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {genderOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-200 border',
                  formData.gender === option.value
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5',
                )}
                onClick={() => handleChange('gender', option.value)}
              >
                <IconComponent className="h-5 w-5 mb-2" />
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

      <div className="space-y-2">
        <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
          Choose Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-200 border',
                  formData.role === option.value
                    ? 'border-primary bg-primary text-white shadow-md'
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

      <div className="mt-2">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="px-6 py-2 rounded-lg border border-gray-300 text-foreground hover:bg-gray-50 transition-colors"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            className="px-6 py-2 rounded-lg font-semibold transition bg-primary text-white dark:bg-primary dark:text-white hover:bg-[#015d33]"
            onClick={handleContinue}
            isLoading={isLoading}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Debug section */}
      {/* <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Debug - Current Form Data:</h3>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}
