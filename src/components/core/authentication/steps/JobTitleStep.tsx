'use client';

import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
  const selectedJobTitle = jobTitles.find((jt) => jt.id === selectedJobTitleId) ?? undefined;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('mainJobTitleId', '', { shouldValidate: true });
    void trigger('mainJobTitleId');
  };

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
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
          <Select
            value={selectedJobTitleId ?? undefined}
            onValueChange={(value) => {
              setValue('mainJobTitleId', value, { shouldValidate: true });
              void trigger('mainJobTitleId');
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
              <SelectValue asChild placeholder="Select your job title">
                {selectedJobTitle ? (
                  <div className="py-1.5">
                    <span className="text-sm font-inter font-medium text-left block">
                      {selectedJobTitle.name}
                    </span>
                  </div>
                ) : (
                  <span className="truncate">
                    {isLoadingJobTitles
                      ? 'Loading job titles...'
                      : jobTitles.length === 0
                        ? 'No job titles available'
                        : 'Select your job title'}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {jobTitles.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                  {isLoadingJobTitles ? 'Loading...' : 'No job titles available'}
                </div>
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
          {selectedJobTitleId && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-10 w-10 shrink-0"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {errors.mainJobTitleId && (
          <p id="jobTitle-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
            {errors.mainJobTitleId.message}
          </p>
        )}
      </div>
    </div>
  );
}
