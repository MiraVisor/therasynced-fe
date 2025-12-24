'use client';

import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { SignupFormData } from '../MultiStepSignup';

export function ClinicAddressStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormData>();
  return (
    <div className="w-full space-y-2">
      <div className="text-center space-y-1 mb-4">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Clinic Address</h3>
        <p className="text-xs font-inter text-gray-600">Enter your clinic address (optional)</p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-inter font-medium text-gray-700" htmlFor="clinicAddress">
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
}
