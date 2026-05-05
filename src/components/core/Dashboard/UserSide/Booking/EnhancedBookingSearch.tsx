'use client';

import { format, parseISO, startOfToday } from 'date-fns';
import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/ui/tier-badge';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useProfile } from '@/hooks/queries/useProfile';
import { useAvailableSlotsByDate, useFreelancersByDate } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { searchFreelancers } from '@/services/freelancerService';
import { getApiErrorMessage } from '@/types/common';
import { LocationType } from '@/types/enums';
import { Expert } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

type BookingStep =
  | 'method-selection'
  | 'search'
  | 'date'
  | 'time'
  | 'service'
  | 'location'
  | 'confirm';

export function EnhancedBookingSearch() {
  const router = useRouter();
  const today = startOfToday();

  // Search state
  const [searchMethod, setSearchMethod] = useState<'name' | 'location' | 'date' | null>(null);
  const [nameQuery, setNameQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Expert[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>('method-selection');
  const [selectedFreelancer, setSelectedFreelancer] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [homeAddress, setHomeAddress] = useState('');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const { data: userProfile } = useProfile();

  // Get freelancers available on selected date (for date browse method)
  const { data: freelancersByDate = [], isLoading: isLoadingByDate } = useFreelancersByDate({
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    limit: 100,
  });

  // Get slots for selected freelancer and date
  const {
    data: freelancerSlots = [],
    isLoading: isLoadingSlots,
    isFetching: isFetchingSlots,
  } = useAvailableSlotsByDate({
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    freelancerId: selectedFreelancer?.id ?? '',
    limit: 100,
  });

  // Pre-populate address from user profile
  useEffect(() => {
    if (!selectedSlot && !homeAddress && userProfile?.homeAddress) {
      setHomeAddress(userProfile.homeAddress);
    }
  }, [userProfile, selectedSlot, homeAddress]);

  // Map freelancers from date API to Expert format
  const freelancersWithSlots = useMemo(() => {
    if (!selectedDate || !freelancersByDate.length) return [];

    return freelancersByDate.map((freelancer) => {
      let jobTitleName = '';
      if (typeof freelancer.jobTitle === 'string') {
        jobTitleName = freelancer.jobTitle;
      } else if (
        freelancer.jobTitle &&
        typeof freelancer.jobTitle === 'object' &&
        'name' in freelancer.jobTitle
      ) {
        jobTitleName = (freelancer.jobTitle as { name: string }).name;
      }

      return {
        id: freelancer.id,
        name: freelancer.name || '',
        specialty: '',
        rating: freelancer.rating || 0,
        reviews: 0,
        description: '',
        profilePicture: freelancer.profilePicture,
        jobTitle: { id: '', name: jobTitleName, description: '' },
        cardInfo: {
          name: freelancer.name || '',
          averageRating: freelancer.rating || 0,
          totalRatings: 0,
        },
        city: undefined,
        clinicAddress: undefined,
      };
    }) as Expert[];
  }, [selectedDate, freelancersByDate]);

  // Perform search with pagination
  const performSearch = useCallback(
    async (page: number = 1) => {
      if (searchMethod === 'date') {
        // Date method uses freelancersByDate hook, no search needed
        return;
      }

      const hasNameQuery = nameQuery.trim().length >= 2;
      const hasLocationQuery = locationQuery.trim().length >= 2;

      if (searchMethod === 'name' && !hasNameQuery) {
        setSearchResults([]);
        setPagination(null);
        return;
      }

      if (searchMethod === 'location' && !hasLocationQuery) {
        setSearchResults([]);
        setPagination(null);
        return;
      }

      setIsSearching(true);

      try {
        const params: any = {
          limit: 10,
          page: page,
          sortBy: 'relevance',
          sortOrder: 'desc',
        };

        if (hasNameQuery) {
          params.query = nameQuery.trim();
        }

        if (hasLocationQuery) {
          params.location = locationQuery.trim();
        }

        const response = await searchFreelancers(params);
        if (response.success && response.data) {
          const mapped = response.data.map(mapOneFreelancerToExpert);

          if (page === 1) {
            // First page - replace results
            setSearchResults(mapped);
          } else {
            // Subsequent pages - append results
            setSearchResults((prev) => [...prev, ...mapped]);
          }

          // Update pagination info
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          if (page === 1) {
            setSearchResults([]);
          }
          setPagination(null);
        }
      } catch (error) {
        console.error('Error searching freelancers:', error);
        if (page === 1) {
          setSearchResults([]);
        }
        setPagination(null);
      } finally {
        setIsSearching(false);
      }
    },
    [nameQuery, locationQuery, searchMethod],
  );

  // Debounced search (only for first page)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchMethod === 'name' || searchMethod === 'location') {
      debounceTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
        performSearch(1);
      }, 300);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [performSearch, searchMethod]);

  // Handle load more
  const handleLoadMore = () => {
    if (pagination?.hasNext && !isSearching) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(nextPage);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    const selected = date || null;
    setSelectedDate(selected);
    setDatePopoverOpen(false);
    // For date browse method, stay on search step to show freelancers
    // For booking flow, move to time step if freelancer is selected
    if (selected && selectedFreelancer && bookingStep !== 'search') {
      setBookingStep('time');
    }
  };

  // Handle method selection
  const handleMethodSelect = (method: 'name' | 'location' | 'date') => {
    setSearchMethod(method);
    setBookingStep('search');
    setNameQuery('');
    setLocationQuery('');
    setSelectedDate(null);
    setSearchResults([]);
    setCurrentPage(1);
    setPagination(null);
    setTimeout(() => {
      if (method === 'name' && nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 300);
  };

  // Handle freelancer selection
  const handleFreelancerSelect = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer);
    // If date is already selected (date browse method), go directly to time selection
    if (selectedDate) {
      setBookingStep('time');
    } else {
      // Otherwise, go to date selection step
      setBookingStep('date');
    }
  };

  // Handle slot selection
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setSelectedService('');
    setLocationType(null);
    setBookingStep('service');
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (bookingStep === 'time' && selectedSlot) {
      setBookingStep('service');
    } else if (bookingStep === 'service' && selectedService) {
      setBookingStep('location');
    } else if (bookingStep === 'location') {
      if (!locationType) {
        toast.error('Please select a location');
        return;
      }
      if (locationType === LocationType.HOME && !homeAddress.trim()) {
        toast.error('Please enter your address for home visit appointments');
        return;
      }
      setBookingStep('confirm');
    }
  };

  const handlePreviousStep = () => {
    // Previous/Next buttons are for booking step navigation only
    if (bookingStep === 'time') {
      setBookingStep('date');
      setSelectedSlot(null);
    } else if (bookingStep === 'service') {
      setBookingStep('time');
      setSelectedSlot(null);
      setSelectedService('');
    } else if (bookingStep === 'location') {
      setBookingStep('service');
      setLocationType(null);
    } else if (bookingStep === 'confirm') {
      setBookingStep('location');
    }
  };

  // Handle back button (goes back to method selection from search step)
  const handleBackToMethodSelection = () => {
    setBookingStep('method-selection');
    setSearchMethod(null);
    setNameQuery('');
    setLocationQuery('');
    setSelectedDate(null);
    setSearchResults([]);
    setCurrentPage(1);
    setPagination(null);
  };

  // Handle back to search step (from date/booking flow steps)
  const handleBackToSearch = () => {
    setBookingStep('search');
    setSelectedFreelancer(null);
    // Preserve selectedDate for date browse method, clear it for others
    if (searchMethod !== 'date') {
      setSelectedDate(null);
    }
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
  };

  const canGoNext = () => {
    if (bookingStep === 'time') return !!selectedSlot;
    if (bookingStep === 'service') return !!selectedService;
    if (bookingStep === 'location') {
      return !!locationType && (locationType !== LocationType.HOME || !!homeAddress.trim());
    }
    return false;
  };

  // Get available slots for display
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedFreelancer) return [];

    return freelancerSlots.filter((slot) => {
      const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return slotDate === selectedDateStr && slot.status === 'AVAILABLE';
    });
  }, [selectedDate, selectedFreelancer, freelancerSlots]);

  // Get selected slot data
  const selectedSlotData = useMemo(() => {
    if (!selectedSlot) return null;
    return freelancerSlots.find((s) => s.id === selectedSlot) || null;
  }, [selectedSlot, freelancerSlots]);

  // Get available services from selected slot
  const availableServices = useMemo(() => {
    return selectedSlotData?.availableServiceCategories || [];
  }, [selectedSlotData]);

  // Get selected service data
  const selectedServiceData = useMemo(() => {
    if (!availableServices.length || !selectedService) return null;
    return availableServices.find((s) => s.id === selectedService) || null;
  }, [availableServices, selectedService]);

  // Get available location types
  const availableLocationTypes = useMemo(() => {
    if (!selectedServiceData?.locationTypes) return [];
    return selectedServiceData.locationTypes as LocationType[];
  }, [selectedServiceData]);

  // Auto-select location if only one option
  useEffect(() => {
    if (availableLocationTypes.length === 1 && !locationType) {
      setLocationType(availableLocationTypes[0] || null);
    }
  }, [availableLocationTypes, locationType]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedSlotData) return 0;

    if (selectedServiceData && locationType) {
      const servicePricing = (selectedServiceData as any).pricing;
      if (servicePricing?.[locationType]?.price) {
        return Number(servicePricing[locationType].price) ?? 0;
      }
    }

    let price = selectedSlotData.basePrice ?? 0;
    if (selectedSlotData.location?.additionalFee && locationType === LocationType.CLINIC) {
      price += selectedSlotData.location.additionalFee;
    }
    return price;
  }, [selectedSlotData, selectedServiceData, locationType]);

  // Check if booking is complete
  const canConfirmBooking =
    selectedSlot &&
    selectedService &&
    locationType &&
    (locationType !== LocationType.HOME || homeAddress.trim());

  // Booking handlers
  const proceedWithBooking = () => {
    if (!selectedSlot || !locationType) return;

    createBooking(
      {
        slotId: selectedSlot,
        serviceCategoryIds: selectedService ? [selectedService] : [],
        clientAddress: locationType === LocationType.HOME ? homeAddress : undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          toast.success('Booking confirmed!');
          setTimeout(() => {
            router.push('/dashboard/my-bookings');
          }, 2000);
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error) || 'Failed to create booking');
        },
      },
    );
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (!locationType) {
      toast.error('Please select a location');
      return;
    }
    if (locationType === LocationType.HOME && !homeAddress.trim()) {
      toast.error('Please enter your address for home visit appointments');
      return;
    }
    proceedWithBooking();
  };

  // Determine which results to show
  const displayResults = useMemo(() => {
    if (searchMethod === 'date' && selectedDate) {
      return freelancersWithSlots;
    }
    return searchResults;
  }, [searchMethod, selectedDate, freelancersWithSlots, searchResults]);

  const isLoading = isSearching || (searchMethod === 'date' && isLoadingByDate);
  const hasResults = displayResults.length > 0;

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-mint/30 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-charcoal mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6 font-inter">
              Your appointment has been successfully booked
            </p>
            <Button
              onClick={() => router.push('/dashboard/my-bookings')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              View My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Method Selection Screen
  if (bookingStep === 'method-selection') {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-white to-mint/5">
          <CardContent className="p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-charcoal mb-3">
                How would you like to find your freelancer?
              </h2>
              <p className="text-gray-600">Choose your preferred search method to get started</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Search by Name */}
              <button
                onClick={() => handleMethodSelect('name')}
                className="group relative p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Search by Name</h3>
                    <p className="text-sm text-gray-600">
                      Know who you're looking for? Type their name to find them quickly.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              {/* Search by Location */}
              <button
                onClick={() => handleMethodSelect('location')}
                className="group relative p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Search by Location</h3>
                    <p className="text-sm text-gray-600">
                      Find freelancers near you or in a specific city or area.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              {/* Browse by Date */}
              <button
                onClick={() => handleMethodSelect('date')}
                className="group relative p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">Browse by Date</h3>
                    <p className="text-sm text-gray-600">
                      See who's available on a specific date. Perfect for planning ahead.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Search Step
  if (bookingStep === 'search') {
    return (
      <div className="w-full">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToMethodSelection} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Methods
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-xl font-semibold text-charcoal">
              {searchMethod === 'name' && 'Search by Name'}
              {searchMethod === 'location' && 'Search by Location'}
              {searchMethod === 'date' && 'Browse by Date'}
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          {searchMethod === 'name' && (
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6" />
                  <Input
                    ref={nameInputRef}
                    type="text"
                    placeholder="Enter freelancer name..."
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="pl-12 pr-10 h-14 text-lg border-primary/30 focus:border-primary focus:ring-primary"
                  />
                  {nameQuery && (
                    <button
                      onClick={() => setNameQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {searchMethod === 'location' && (
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Location
                </Label>
                <LocationDropdown
                  value={locationQuery}
                  onValueChange={(value) => setLocationQuery(value)}
                  placeholder="Select your city"
                  searchPlaceholder="Search locations..."
                  emptyMessage="No location found."
                  className="h-14"
                />
              </CardContent>
            </Card>
          )}

          {searchMethod === 'date' && (
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6" />
                      <Input
                        type="text"
                        placeholder="Click to select a date..."
                        value={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                        readOnly
                        className="pl-12 pr-10 h-14 text-lg border-primary/30 focus:border-primary focus:ring-primary cursor-pointer"
                        onClick={() => setDatePopoverOpen(true)}
                      />
                      {selectedDate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(null);
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < today}
                      className="rounded-md border-0"
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        {isLoading && currentPage === 1 && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !hasResults && (nameQuery || locationQuery || selectedDate) && (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-charcoal mb-2">No freelancers found</h3>
              <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasResults && (
          <>
            <div className="space-y-3 mb-6">
              {displayResults.map((freelancer) => (
                <Card
                  key={freelancer.id}
                  onClick={() => handleFreelancerSelect(freelancer)}
                  className="border border-gray-200 hover:border-primary/30 cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-gray-200">
                        <ProfileAvatarImage
                          src={freelancer.profilePicture || undefined}
                          alt={freelancer.name || 'Freelancer'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-mint/20 text-primary font-semibold text-lg">
                          {freelancer.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-lg text-charcoal">
                                {freelancer.name}
                              </h3>
                              <VerificationBadge
                                status={freelancer.verificationStatus || 'unverified'}
                                size="sm"
                              />
                              {freelancer.tier && (
                                <TierBadge tier={freelancer.tier} size="sm" showIcon={true} />
                              )}
                            </div>
                            {freelancer.jobTitle?.name && (
                              <p className="text-sm text-gray-600 mb-2">
                                {freelancer.jobTitle.name}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 flex-shrink-0 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <RatingDisplay
                            rating={freelancer.rating ?? freelancer.cardInfo?.averageRating}
                            reviewCount={
                              freelancer.cardInfo?.totalRatings ?? freelancer.reviews ?? 0
                            }
                            size="sm"
                            showCount={true}
                          />
                          {(freelancer.cityTown || freelancer.county) && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">
                                {[freelancer.cityTown, freelancer.county]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination - Load More Button */}
            {pagination?.hasNext && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  variant="outline"
                  className="gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More ({pagination.total - displayResults.length} remaining)
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {pagination && (
              <div className="text-center mt-4 text-sm text-gray-500">
                Showing {displayResults.length} of {pagination.total} freelancers
                {pagination.hasNext && ' • More available'}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Date Selection Step
  if (bookingStep === 'date' && selectedFreelancer) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSearch} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-xl font-semibold text-charcoal">{selectedFreelancer.name}</h2>
            <p className="text-sm text-gray-500">
              {selectedFreelancer.jobTitle?.name || 'Freelancer'}
            </p>
          </div>
        </div>

        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <Label className="text-sm font-medium text-gray-700 mb-4 block">Select a Date</Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6" />
                  <Input
                    type="text"
                    placeholder="Click to select a date..."
                    value={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                    readOnly
                    className="pl-12 pr-10 h-14 text-lg border-primary/30 focus:border-primary focus:ring-primary cursor-pointer"
                    onClick={() => setDatePopoverOpen(true)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < today}
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Booking Flow Steps (Time, Service, Location, Confirm)
  if (selectedFreelancer && selectedDate) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSearch} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-xl font-semibold text-charcoal">{selectedFreelancer.name}</h2>
            <p className="text-sm text-gray-500">
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Time Selection */}
            {bookingStep === 'time' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-charcoal">Select Time</h3>
                </div>
                {isLoadingSlots || (isFetchingSlots && availableSlots.length === 0) ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-gray-600">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium">
                          {isLoadingSlots
                            ? 'Fetching available slots for you, please hang on...'
                            : 'Refetching slots for you, please hang on...'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No available slots on {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                    <Button variant="outline" onClick={() => setBookingStep('date')}>
                      Select Different Date
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {availableSlots.map((slot) => {
                        const slotTime = parseISO(slot.startTime);
                        const isSelected = selectedSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot.id)}
                            className={cn(
                              'py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                              isSelected
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white  border border-gray-200  hover:border-primary/50 text-charcoal ',
                            )}
                          >
                            {format(slotTime, 'h:mm a')}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleNextStep} disabled={!canGoNext()} className="gap-2">
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Service Selection */}
            {bookingStep === 'service' && selectedSlot && availableServices.length > 0 && (
              <div className="animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-charcoal">Select Service</h3>
                </div>
                <RadioGroup
                  value={selectedService}
                  onValueChange={(value) => {
                    setSelectedService(value);
                    setLocationType(null);
                  }}
                  className="space-y-2 mb-6"
                >
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                        selectedService === service.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200  hover:border-primary/50 bg-white ',
                      )}
                      onClick={() => {
                        setSelectedService(service.id);
                        setLocationType(null);
                      }}
                    >
                      <RadioGroupItem value={service.id} id={service.id} />
                      <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                        <span className="font-medium text-charcoal">{service.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNextStep} disabled={!canGoNext()} className="gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Location Selection */}
            {bookingStep === 'location' && selectedService && availableLocationTypes.length > 0 && (
              <div className="animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-charcoal">Select Location</h3>
                </div>
                <RadioGroup
                  value={locationType || undefined}
                  onValueChange={(value) => setLocationType(value as LocationType)}
                  className="space-y-2 mb-6"
                >
                  {availableLocationTypes.includes(LocationType.HOME) && (
                    <div
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                        locationType === LocationType.HOME
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200  hover:border-primary/50 bg-white ',
                      )}
                      onClick={() => setLocationType(LocationType.HOME)}
                    >
                      <RadioGroupItem value={LocationType.HOME} id="home" />
                      <Home className="w-5 h-5 text-gray-500" />
                      <Label htmlFor="home" className="flex-1 cursor-pointer">
                        <span className="font-medium text-charcoal">At Home</span>
                      </Label>
                    </div>
                  )}
                  {availableLocationTypes.includes(LocationType.CLINIC) && (
                    <div
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                        locationType === LocationType.CLINIC
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200  hover:border-primary/50 bg-white ',
                      )}
                      onClick={() => setLocationType(LocationType.CLINIC)}
                    >
                      <RadioGroupItem value={LocationType.CLINIC} id="clinic" />
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <Label htmlFor="clinic" className="flex-1 cursor-pointer">
                        <span className="font-medium text-charcoal">At Clinic</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                {/* Address input for home visits */}
                {locationType === LocationType.HOME && (
                  <div className="mb-6 space-y-2">
                    <Input
                      placeholder="Enter your address"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className={cn(
                        'bg-white ',
                        !homeAddress.trim() &&
                          'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
                      )}
                    />
                    {!homeAddress.trim() && (
                      <p className="text-xs text-yellow-600">
                        Please enter your address to continue
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNextStep} disabled={!canGoNext()} className="gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {bookingStep === 'confirm' && (
              <div className="animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-charcoal">Review & Confirm</h3>
                </div>
                {canConfirmBooking ? (
                  <>
                    <div className="space-y-3 mb-6">
                      {selectedFreelancer && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Freelancer:</span>
                          <span className="font-medium text-charcoal">
                            {selectedFreelancer.name}
                          </span>
                        </div>
                      )}
                      {selectedDate && selectedSlotData && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Date & Time:</span>
                          <span className="font-medium text-charcoal">
                            {format(parseISO(selectedSlotData.startTime), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                      {selectedServiceData && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium text-charcoal">
                            {selectedServiceData.name}
                          </span>
                        </div>
                      )}
                      {locationType && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-charcoal">
                            {locationType === LocationType.HOME ? 'At Home' : 'At Clinic'}
                          </span>
                        </div>
                      )}
                      {locationType === LocationType.HOME && homeAddress && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-charcoal text-right max-w-[60%]">
                            {homeAddress}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-4">
                        <span className="text-lg font-semibold text-charcoal">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        onClick={handlePreviousStep}
                        className="flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        disabled={isCreating}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-base font-semibold"
                        size="lg"
                      >
                        {isCreating ? 'Confirming...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        {locationType === LocationType.HOME && !homeAddress.trim()
                          ? 'Please go back and enter your address for home visit appointments.'
                          : 'Please complete all required fields to confirm your booking.'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Go Back
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
