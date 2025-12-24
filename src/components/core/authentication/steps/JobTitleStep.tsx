'use client';

import { useFormContext } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobTitles } from '@/hooks/queries/useJobTitles';
import { cn } from '@/lib/utils';

import { SignupFormData } from '../MultiStepSignup';

export function JobTitleStep() {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const selectedJobTitleId = watch('mainJobTitleId');
  const { data: jobTitles = [], isLoading: isLoadingJobTitles } = useJobTitles();

  return (
    <div className="w-full space-y-2">
      <div className="text-center space-y-1 mb-4">
        <h3 className="text-xl font-poppins font-bold text-charcoal">Job Title</h3>
        <p className="text-xs font-inter text-gray-600">Select your profession or specialty</p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-inter font-medium text-gray-700" htmlFor="mainJobTitleId">
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
                      <span className="text-xs text-gray-500 block">{jobTitle.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.mainJobTitleId && (
          <p id="jobTitle-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
            {errors.mainJobTitleId.message}
          </p>
        )}
      </div>
    </div>
  );
}
