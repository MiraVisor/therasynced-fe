'use client';

import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
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
import { useSignupUIStore } from '@/stores/signupUIStore';

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

  const {
    isRequestingLocation,
    locationPermissionGranted,
    setIsRequestingLocation,
    setLocationPermissionGranted,
  } = useSignupUIStore();

  const onRequestLocation = async () => {
    setIsRequestingLocation(true);

    if (!('geolocation' in navigator)) {
      toast.error(
        'Geolocation is not supported by your browser. Please enter your county and town manually.',
      );
      setIsRequestingLocation(false);
      return;
    }

    // Step 1: ask the browser for the user's coordinates. Handle each
    // GeolocationPositionError code separately so the user sees a
    // specific, actionable message instead of a generic "failed."
    let position: GeolocationPosition;
    try {
      position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        });
      });
    } catch (geoError) {
      const code = (geoError as GeolocationPositionError)?.code;
      if (code === 1 /* PERMISSION_DENIED */) {
        toast.error(
          'Location access was blocked. Please allow location in your browser settings, or enter your county and town manually below.',
        );
      } else if (code === 2 /* POSITION_UNAVAILABLE */) {
        toast.error(
          "We couldn't determine your location right now. Please try again or enter your county and town manually.",
        );
      } else if (code === 3 /* TIMEOUT */) {
        toast.error(
          'Location request timed out. Please try again or enter your county and town manually.',
        );
      } else {
        toast.error('Location lookup failed. Please enter your county and town manually.');
      }
      setIsRequestingLocation(false);
      return;
    }

    // Step 2: reverse-geocode coordinates to county/city.
    // Try OpenStreetMap Nominatim first (no API key, reliable), fall back to BigDataCloud.
    const { latitude, longitude } = position.coords;
    let countyName = '';
    let cityTownName = '';

    try {
      // Primary: OpenStreetMap Nominatim (free, no key, reliable)
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'TheraSynced/1.0' } },
      );
      if (osmResponse.ok) {
        const osmData = await osmResponse.json();
        const addr = osmData.address || {};
        // For Ireland: county is in addr.county, city/town in addr.city or addr.town or addr.village
        countyName = (addr.county || addr.state || '').replace(/^County\s+/i, '');
        cityTownName = addr.city || addr.town || addr.village || addr.suburb || '';
      }
    } catch {
      // Nominatim failed, try BigDataCloud as fallback
      try {
        const bdcResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );
        if (bdcResponse.ok) {
          const data = await bdcResponse.json();
          const adminLevels: Array<{ name: string; order: number }> =
            data.localityInfo?.administrative || [];
          const sorted = [...adminLevels].sort((a, b) => a.order - b.order);
          countyName = (
            sorted.find((l) => l.name.toLowerCase().startsWith('county'))?.name ||
            sorted.find((l) => l.order === 6)?.name ||
            data.principalSubdivision ||
            ''
          ).replace(/^County\s+/i, '');
          cityTownName = data.locality || data.city || '';
        }
      } catch {
        // Both APIs failed
      }
    }

    if (countyName || cityTownName) {
      if (countyName) setValue('county', countyName);
      if (cityTownName) setValue('cityTown', cityTownName);
      setLocationPermissionGranted(true);
      const display = [cityTownName, countyName].filter(Boolean).join(', ');
      toast.success(`Location found: ${display}`);
    } else {
      toast.info('Could not detect your location. Please enter your county and town manually.');
    }

    setIsRequestingLocation(false);
  };
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
          <div className="flex gap-2">
            <Input
              id="cityTown"
              type="text"
              placeholder="Enter your city or town"
              value={watch('cityTown') || ''}
              onChange={(e) => setValue('cityTown', e.target.value)}
              className="h-10 text-sm font-inter flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onRequestLocation}
              disabled={isRequestingLocation || locationPermissionGranted}
              className="h-10 px-3 border-gray-300"
              title="Detect my location"
            >
              {isRequestingLocation ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
          </div>
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
