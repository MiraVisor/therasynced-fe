'use client';

import { format } from 'date-fns';
import { CalendarIcon, Search, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useServiceCategories } from '@/hooks/queries/useServiceCategories';
import { cn } from '@/lib/utils';
import { searchFreelancersAutocomplete } from '@/services/freelancerService';
import { useBookingStore } from '@/stores/bookingStore';
import { Expert } from '@/types/types';

interface QuestionnaireStepProps {
  onSearch: () => void;
}

export const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({ onSearch }) => {
  const {
    preferredDate,
    selectedServiceCategories,
    bookingFor,
    locationPreference,
    freelancerSearchQuery,
    setPreferredDate,
    setSelectedServiceCategories,
    setBookingFor,
    setLocationPreference,
    setFreelancerSearchQuery,
  } = useBookingStore();

  const { data: serviceCategories = [], isLoading: loadingCategories } = useServiceCategories();
  const [searchSuggestions, setSearchSuggestions] = useState<Expert[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced freelancer search
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setFreelancerSearchQuery(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await searchFreelancersAutocomplete(value, 5);
          if (response.success && response.data) {
            setSearchSuggestions(response.data);
            setShowSuggestions(true);
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSearchSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300);
    },
    [setFreelancerSearchQuery],
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleServiceCategoryToggle = (categoryId: string) => {
    const current = selectedServiceCategories;
    if (current.includes(categoryId)) {
      setSelectedServiceCategories(current.filter((id) => id !== categoryId));
    } else {
      setSelectedServiceCategories([...current, categoryId]);
    }
  };

  const handleSuggestionSelect = (freelancer: Expert) => {
    setFreelancerSearchQuery(freelancer.name);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const canProceed = preferredDate !== null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-poppins font-bold text-charcoal dark:text-white">
          Tell us what you need
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          We'll help you find the perfect therapist
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Preferred Date */}
        <div className="space-y-3">
          <Label className="text-lg font-poppins font-semibold text-charcoal dark:text-white">
            When would you like your appointment? <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !preferredDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {preferredDate ? format(preferredDate, 'PPP') : 'Select a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={preferredDate || undefined}
                onSelect={(date) => setPreferredDate(date || null)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Service Categories */}
        <div className="space-y-3">
          <Label className="text-lg font-poppins font-semibold text-charcoal dark:text-white">
            What type of services do you need? (Optional)
          </Label>
          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
              {serviceCategories.slice(0, 10).map((category) => (
                <div key={category.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedServiceCategories.includes(category.id)}
                    onCheckedChange={() => handleServiceCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-inter text-gray-700 dark:text-gray-300 cursor-pointer leading-tight"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          {serviceCategories.length > 10 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing first 10 categories. More will be available after search.
            </p>
          )}
        </div>

        {/* Booking For */}
        <div className="space-y-3">
          <Label className="text-lg font-poppins font-semibold text-charcoal dark:text-white">
            Who is this booking for?
          </Label>
          <RadioGroup
            value={bookingFor}
            onValueChange={(value) => setBookingFor(value as 'myself' | 'someone-else')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="myself" id="myself" />
              <Label htmlFor="myself" className="font-normal cursor-pointer">
                Booking for myself
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="someone-else" id="someone-else" />
              <Label htmlFor="someone-else" className="font-normal cursor-pointer">
                Booking for someone else
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Location Preference */}
        <div className="space-y-3">
          <Label className="text-lg font-poppins font-semibold text-charcoal dark:text-white">
            Location preference (Optional)
          </Label>
          <RadioGroup
            value={locationPreference}
            onValueChange={(value) => setLocationPreference(value as 'HOME' | 'CLINIC' | 'BOTH')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HOME" id="home" />
              <Label htmlFor="home" className="font-normal cursor-pointer">
                At home
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CLINIC" id="clinic" />
              <Label htmlFor="clinic" className="font-normal cursor-pointer">
                At clinic
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BOTH" id="both" />
              <Label htmlFor="both" className="font-normal cursor-pointer">
                Either is fine
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Freelancer Name Search */}
        <div className="space-y-3">
          <Label className="text-lg font-poppins font-semibold text-charcoal dark:text-white">
            Search for a specific therapist (Optional)
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Type therapist name..."
              value={freelancerSearchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="pl-10"
            />
            {loadingSuggestions && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchSuggestions.map((freelancer) => (
                  <button
                    key={freelancer.id}
                    type="button"
                    onClick={() => handleSuggestionSelect(freelancer)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {freelancer.name}
                      </div>
                      {freelancer.specialty && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {freelancer.specialty}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="pt-4">
          <Button
            onClick={onSearch}
            disabled={!canProceed}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
            size="lg"
          >
            Search Therapists
          </Button>
          {!canProceed && (
            <p className="text-sm text-red-500 mt-2 text-center">
              Please select a preferred date to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
