'use client';

import { format } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { SignupFormData } from '../MultiStepSignup';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function PersonalDetailsStep() {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const selectedDob = watch('dob');

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
            <span className="text-gray-500 ml-1">(Must be 18+)</span>
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
                {selectedDob ? format(selectedDob, 'PPP') : <span>Select your date of birth</span>}
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
                toYear={new Date().getFullYear() - 18}
                defaultMonth={
                  new Date(
                    new Date().getFullYear() - 18,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.dob && (
            <p id="dob-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
              {errors.dob.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">You must be at least 18 years old to sign up</p>
        </div>

        {/* Gender Field */}
        <div className="space-y-1">
          <label htmlFor="gender" className="text-xs font-inter font-medium text-gray-700">
            Gender
          </label>
          <Select
            value={watch('gender') ?? undefined}
            onValueChange={(value) => {
              setValue('gender', value);
              void trigger('gender');
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
            <p id="gender-error" className="text-red-500 text-xs font-inter mt-0.5" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* County Field */}
        <div className="space-y-1">
          <label className="text-xs font-inter font-medium text-gray-700">County</label>
          <LocationDropdown
            value={watch('county') || ''}
            onValueChange={(value) => setValue('county', value)}
            placeholder="Select your county"
            searchPlaceholder="Search counties..."
            emptyMessage="No county found."
          />
          {errors.county && (
            <p className="text-red-500 text-xs font-inter mt-0.5">{errors.county.message}</p>
          )}
        </div>

        {/* City/Town Field */}
        <div className="space-y-1">
          <label htmlFor="cityTown" className="text-xs font-inter font-medium text-gray-700">
            City/Town
            <span className="text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input
            id="cityTown"
            type="text"
            placeholder="Enter your city or town"
            value={watch('cityTown') || ''}
            onChange={(e) => setValue('cityTown', e.target.value)}
            className="h-10 text-sm font-inter"
          />
        </div>

        {/* Home Address Field - Only for patients */}
        {watch('role') === 'patient' && (
          <div className="space-y-1">
            <label htmlFor="homeAddress" className="text-xs font-inter font-medium text-gray-700">
              Home Address
              <span className="text-gray-500 ml-1">(Required for bookings)</span>
            </label>
            <Input
              id="homeAddress"
              type="text"
              placeholder="Enter your home address for bookings"
              value={watch('homeAddress') || ''}
              onChange={(e) => setValue('homeAddress', e.target.value)}
              className="h-10 text-sm font-inter"
            />
            <p className="text-xs text-gray-500">
              This address will be used for home visit bookings. You can update it later in your
              profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
