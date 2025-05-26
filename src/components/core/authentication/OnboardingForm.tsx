'use client';

import { useState } from 'react';

import { DatePicker } from '@/components/common/input/DatePicker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface OnboardingFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}
const genderOptions = ['male', 'female', 'non-binary'];
const roleOptions = ['patient', 'team', 'freelancer'];
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
      <div>
        <p className="font-semibold">Looking For</p>

        {genderOptions.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-2 cursor-pointer "
            onClick={() => handleChange('gender', option)}
          >
            <Checkbox checked={formData.gender === option} className=" h-[18px] w-[18px]" />
            <span className="text-grey">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
          </label>
        ))}
      </div>

      <div>
        <DatePicker
          title="Date of Birth"
          onChange={(date) => handleChange('dob', date?.toISOString() ?? '')}
        />
      </div>

      <div>
        <label className="block text-foreground font-semibold text-[18px] mb-1">Location</label>
        <input
          type="text"
          placeholder="City"
          className={cn(
            'flex w-full justify-between items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-left text-sm font-normal text-muted-foreground bg-background text-foreground',
          )}
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block text-foreground font-semibold text-[18px] mb-2 ">Choose</label>
        {roleOptions.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-2 cursor-pointer "
            onClick={() => handleChange('role', option)}
          >
            <Checkbox
              checked={formData.role === option}
              className="rounded-full h-[20px] w-[20px]"
            />
            <span className="text-grey">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-center mt-4 gap-4">
        <Button
          variant="outline"
          className="border border-black text-black px-4 py-2 rounded bg-background text-foreground "
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="blackOutline"
          className="bg-black text-white px-4 py-2 rounded border-border"
          onClick={handleContinue}
          isLoading={isLoading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
