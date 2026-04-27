'use client';

import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { SignupFormData } from '../MultiStepSignup';

const roleOptions = [
  { value: 'patient', label: 'Client' },
  { value: 'freelancer', label: 'Freelancer' },
];

export function RoleSelectionStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const selectedRole = watch('role');
  return (
    <div className="w-full space-y-2">
      <div className="text-center space-y-1 mb-4">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Choose Your Role</h3>
        <p className="text-xs font-inter text-gray-600">Select how you&apos;ll use the platform</p>
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
              type="radio">
              {...register('role')}
              value={option.value}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <div className="flex-1">
              <div className="font-inter font-semibold text-charcoal text-sm">{option.label}</div>
              <div className="text-xs font-inter text-gray-600 mt-0.5">
                {option.value === 'patient'
                  ? 'Book appointments and access wellness services'
                  : 'Provide services and manage your practice'}
              </div>
            </div>
          </label>
        ))}
      </div>
      {errors.role && <p className="text-red-500 text-xs font-inter mt-1">{errors.role.message}</p>}
    </div>
  );
}
