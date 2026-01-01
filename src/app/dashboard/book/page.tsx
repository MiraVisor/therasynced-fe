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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useBookingSearch } from '@/hooks/queries/useBookingSearch';
import { useProfile, useUpdateProfile } from '@/hooks/queries/useProfile';
import { useAvailableSlots, useAvailableSlotsByDate } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/types/common';
import { LocationType } from '@/types/enums';
import { Expert } from '@/types/types';

type Step = 'therapist' | 'time' | 'services' | 'location' | 'summary';

export default function BookingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [homeAddress, setHomeAddress] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('therapist');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const { data: userProfile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();

  // Pre-populate address from user profile when available
  useEffect(() => {
    if (userProfile && !homeAddress) {
      // Use homeAddress from profile if available
      if (userProfile.homeAddress) {
        setHomeAddress(userProfile.homeAddress);
      }
    }
  }, [userProfile, homeAddress]);

  // Get today's date for calendar min date
  const today = startOfToday();

  // Fetch slots for calendar to show availability indicators
  // Note: This is a simplified approach - in production, you might want to fetch slots for a date range
  const { data: allSlotsByDate = [], isLoading: isLoadingCalendarSlots } = useAvailableSlotsByDate({
    date: format(today, 'yyyy-MM-dd'),
    limit: 1000, // Get many slots to check all dates
  });

  // Get slots for selected date
  const { data: slotsForDate = [], isLoading: isLoadingSlotsForDate } = useAvailableSlotsByDate({
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    limit: 100,
  });

  // Search freelancers with date filter
  const { data: searchResults, isLoading: isLoadingFreelancers } = useBookingSearch({
    query: searchQuery || undefined,
    preferredDate: selectedDate,
    enabled: !!selectedDate || !!searchQuery,
  });

  // Get slots for selected freelancer and date
  const { data: freelancerSlots = [], isLoading: isLoadingFreelancerSlots } = useAvailableSlots(
    selectedFreelancer,
    {
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    },
  );

  // Get unique freelancers with slots for selected date
  const freelancersWithSlots = useMemo(() => {
    if (!selectedDate || !slotsForDate.length) return [];

    const freelancerIds = new Set(slotsForDate.map((s) => s.freelancerId));
    const freelancersMap = new Map<string, Expert>();

    // Get freelancers from search results if available
    if (searchResults?.freelancers) {
      searchResults.freelancers.forEach((f) => {
        if (freelancerIds.has(f.id)) {
          freelancersMap.set(f.id, f);
        }
      });
    }

    // If search didn't return all freelancers, create basic objects from slots
    slotsForDate.forEach((slot) => {
      if (!freelancersMap.has(slot.freelancerId)) {
        freelancersMap.set(slot.freelancerId, {
          id: slot.freelancerId,
          name: slot.freelancerName || 'Unknown',
          specialty: '',
          rating: slot.averageRating || 0,
          reviews: slot.numberOfRatings || 0,
          description: '',
          profilePicture: slot.profilePicture,
          jobTitle: { id: '', name: slot.freelancerName || '' },
        } as Expert);
      }
    });

    return Array.from(freelancersMap.values());
  }, [selectedDate, slotsForDate, searchResults]);

  // Get available slots for selected date and freelancer
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    if (selectedFreelancer) {
      // Use freelancer-specific slots
      return freelancerSlots.filter((slot) => {
        const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        return slotDate === selectedDateStr && slot.status === 'AVAILABLE';
      });
    }

    // Use all slots for date
    return slotsForDate.filter((slot) => {
      const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return slotDate === selectedDateStr && slot.status === 'AVAILABLE';
    });
  }, [selectedDate, selectedFreelancer, slotsForDate, freelancerSlots]);

  // Get selected slot data
  const selectedSlotData = useMemo(() => {
    if (!selectedSlot) return null;

    const slot = [...slotsForDate, ...freelancerSlots].find((s) => s.id === selectedSlot);
    if (!slot) return null;

    const freelancer =
      freelancersWithSlots.find((f) => f.id === slot.freelancerId) ??
      ({
        id: slot.freelancerId,
        name: slot.freelancerName ?? 'Unknown',
        specialty: '',
        rating: slot.averageRating ?? 0,
        reviews: slot.numberOfRatings ?? 0,
        description: '',
        profilePicture: slot.profilePicture,
        jobTitle: { id: '', name: '' },
        location: slot.location?.address,
      } as Expert);

    return { slot, freelancer };
  }, [selectedSlot, slotsForDate, freelancerSlots, freelancersWithSlots]);

  // Get available services from selected slot
  const availableServices = useMemo(() => {
    if (!selectedSlotData?.slot?.availableServiceCategories) return [];
    return selectedSlotData.slot.availableServiceCategories;
  }, [selectedSlotData]);

  // Get selected service data
  const selectedServiceData = useMemo(() => {
    if (!availableServices.length || !selectedService) return null;
    return availableServices.find((s) => s.id === selectedService) || null;
  }, [availableServices, selectedService]);

  // Get available location types from selected service
  const availableLocationTypes = useMemo(() => {
    if (!selectedServiceData?.locationTypes) return [];
    return selectedServiceData.locationTypes as LocationType[];
  }, [selectedServiceData]);

  // Auto-select location if only one option
  useEffect(() => {
    if (availableLocationTypes.length === 1 && locationType !== availableLocationTypes[0]) {
      setLocationType(availableLocationTypes[0] ?? null);
    }
  }, [availableLocationTypes, locationType]);

  // Determine current step based on selections
  useEffect(() => {
    if (!selectedDate) {
      setCurrentStep('therapist');
    } else if (!selectedFreelancer) {
      setCurrentStep('therapist');
    } else if (!selectedSlot) {
      setCurrentStep('time');
    } else if (!selectedService) {
      setCurrentStep('services');
    } else if (!locationType) {
      setCurrentStep('location');
    } else {
      setCurrentStep('summary');
    }
  }, [selectedDate, selectedFreelancer, selectedSlot, selectedService, locationType]);

  // Check which dates have slots (for calendar display with modifiers)
  const datesWithSlots = useMemo(() => {
    const dateSet = new Set<string>();
    allSlotsByDate.forEach((slot) => {
      const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      dateSet.add(date);
    });
    return dateSet;
  }, [allSlotsByDate]);

  // Get slot count for a specific date
  const getSlotCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allSlotsByDate.filter((s) => {
      const slotDate = format(parseISO(s.startTime), 'yyyy-MM-dd');
      return slotDate === dateStr;
    }).length;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedFreelancer(null);
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setCurrentStep('therapist');
  };

  const handleTherapistSelect = (freelancerId: string) => {
    setSelectedFreelancer(freelancerId);
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setCurrentStep('time');
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setCurrentStep('services');
  };

  const handleServiceSelect = (serviceId: string) => {
    // Single selection: if clicking the same service, deselect it; otherwise select the new one
    setSelectedService((prev) => (prev === serviceId ? '' : serviceId));
    // Reset location when service changes
    setLocationType(null);
    setHomeAddress('');
  };

  const handleNext = () => {
    if (currentStep === 'therapist' && selectedFreelancer) {
      setCurrentStep('time');
    } else if (currentStep === 'time' && selectedSlot) {
      setCurrentStep('services');
    } else if (currentStep === 'services' && selectedService) {
      setCurrentStep('location');
    } else if (currentStep === 'location' && locationType) {
      setCurrentStep('summary');
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'time') {
      setCurrentStep('therapist');
    } else if (currentStep === 'services') {
      setCurrentStep('time');
    } else if (currentStep === 'location') {
      setCurrentStep('services');
    } else if (currentStep === 'summary') {
      setCurrentStep('services');
    }
  };

  const canGoNext = () => {
    if (currentStep === 'therapist') return !!selectedFreelancer;
    if (currentStep === 'time') return !!selectedSlot;
    if (currentStep === 'services') return !!selectedService;
    if (currentStep === 'location') return !!locationType;
    return false;
  };

  const canGoPrevious = () => {
    return currentStep !== 'therapist';
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
      // Show dialog to collect address
      setTempAddress(homeAddress);
      setShowAddressDialog(true);
      return;
    }

    // Proceed with booking
    proceedWithBooking();
  };

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

  const handleSaveAddress = () => {
    if (tempAddress.trim()) {
      const addressToSave = tempAddress.trim();
      setHomeAddress(addressToSave);
      setShowAddressDialog(false);
      setTempAddress('');

      // Optionally save address to user profile for future use
      if (userProfile && userProfile.homeAddress !== addressToSave) {
        updateProfile(
          { homeAddress: addressToSave },
          {
            onError: () => {
              // Don't block booking if profile update fails
              console.warn('Failed to save address to profile');
            },
          },
        );
      }

      // Retry booking confirmation
      proceedWithBooking();
    } else {
      toast.error('Please enter a valid address');
    }
  };

  if (showSuccess) {
    return (
      <DashboardPageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your appointment has been successfully booked
              </p>
              <Button onClick={() => router.push('/dashboard/my-bookings')} className="w-full">
                View My Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-charcoal dark:text-white mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a date, select a therapist, pick services, and book in seconds
            </p>
          </div>

          {/* Search - Always Visible */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search therapist by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Calendar - Always Visible */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Select Date</h2>
              </div>
              {isLoadingCalendarSlots ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleDateSelect(date);
                      }
                    }}
                    disabled={(date) => {
                      // Only disable past dates, allow all future dates
                      const today = startOfToday();
                      return date < today;
                    }}
                    modifiers={{
                      hasSlots: (date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        return datesWithSlots.has(dateStr);
                      },
                    }}
                    modifiersClassNames={{
                      hasSlots:
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                    }}
                    className="rounded-md border-0"
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 1}
                    components={{
                      DayButton: ({ day, modifiers, ...props }) => {
                        const slotCount = getSlotCountForDate(day.date);
                        const hasSlots = datesWithSlots.has(format(day.date, 'yyyy-MM-dd'));
                        const isSelected = modifiers?.['selected'] ?? false;
                        const isDisabled = modifiers?.['disabled'] ?? false;
                        return (
                          <div className="relative w-full h-full">
                            <button
                              {...props}
                              className={cn(
                                'w-full h-full rounded-md text-sm font-medium transition-all',
                                isSelected && 'bg-primary text-white shadow-lg font-semibold',
                                !isSelected &&
                                  hasSlots &&
                                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50',
                                !isSelected &&
                                  !hasSlots &&
                                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                                isDisabled && 'opacity-50 cursor-not-allowed',
                              )}
                            >
                              <span>{format(day.date, 'd')}</span>
                              {hasSlots && !isSelected && slotCount > 0 && (
                                <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 text-[10px] opacity-70">
                                  {slotCount}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Section - Changes based on step */}
          {selectedDate && (
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Therapist Selection */}
                {currentStep === 'therapist' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">
                        Select Therapist - {format(selectedDate, 'EEEE, MMMM d')}
                      </h2>
                    </div>
                    {isLoadingFreelancers || isLoadingSlotsForDate ? (
                      <div className="flex justify-center items-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : freelancersWithSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                          No therapists available for this date. Please select another date.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {freelancersWithSlots.map((freelancer) => {
                          const slots = availableSlots.filter(
                            (s) => s.freelancerId === freelancer.id,
                          );
                          const isSelected = selectedFreelancer === freelancer.id;
                          return (
                            <Card
                              key={freelancer.id}
                              className={cn(
                                'cursor-pointer hover:shadow-md transition-all',
                                isSelected && 'ring-2 ring-primary',
                              )}
                              onClick={() => handleTherapistSelect(freelancer.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={freelancer.profilePicture || undefined} />
                                    <AvatarFallback>
                                      {freelancer.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{freelancer.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {freelancer.jobTitle?.name ??
                                        freelancer.specialty ??
                                        'Therapist'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm font-medium">
                                        ⭐ {freelancer.rating?.toFixed(1) || 'N/A'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({freelancer.reviews || 0} reviews)
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary">{slots.length} slots</Badge>
                                  {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Time Slot Selection */}
                {currentStep === 'time' && selectedFreelancer && (
                  <div>
                    {(() => {
                      const freelancer = freelancersWithSlots.find(
                        (f) => f.id === selectedFreelancer,
                      );
                      return (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-lg">Select Time</h2>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                            <Avatar>
                              <AvatarImage src={freelancer?.profilePicture || undefined} />
                              <AvatarFallback>
                                {freelancer?.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{freelancer?.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(selectedDate, 'EEEE, MMMM d')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {isLoadingFreelancerSlots ? (
                      <div className="flex justify-center items-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : availableSlots.filter((s) => s.freelancerId === selectedFreelancer)
                        .length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                          No available time slots for this therapist on this date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {availableSlots
                          .filter((s) => s.freelancerId === selectedFreelancer)
                          .map((slot) => {
                            const isSelected = selectedSlot === slot.id;
                            const time = format(parseISO(slot.startTime), 'h:mm a');
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => handleSlotSelect(slot.id)}
                                className={cn(
                                  'p-3 rounded-lg border-2 font-medium text-sm transition-all',
                                  isSelected
                                    ? 'border-primary bg-primary text-white shadow-lg'
                                    : 'border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-primary/5 dark:bg-gray-800 dark:text-white dark:hover:bg-primary/10',
                                )}
                              >
                                <div className="text-center">
                                  <div>{time}</div>
                                  {isSelected && <CheckCircle className="w-4 h-4 mx-auto mt-1" />}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Service Selection */}
                {currentStep === 'services' && selectedSlot && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">Select Services</h2>
                    </div>
                    {availableServices.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                          No services available for this slot. You can proceed without selecting
                          services.
                        </p>
                        <Button onClick={handleNext} className="mt-4">
                          Continue
                        </Button>
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedService}
                        onValueChange={handleServiceSelect}
                        className="space-y-3"
                      >
                        {availableServices.map((service) => {
                          const isSelected = selectedService === service.id;
                          return (
                            <div
                              key={service.id}
                              className={cn(
                                'flex items-start gap-3 p-4 border rounded-lg transition-all cursor-pointer',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
                              )}
                              onClick={() => handleServiceSelect(service.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleServiceSelect(service.id);
                                }
                              }}
                              aria-pressed={isSelected}
                            >
                              <RadioGroupItem id={service.id} value={service.id} className="mt-1" />
                              <div className="flex-1">
                                <Label
                                  htmlFor={service.id}
                                  className="font-medium text-charcoal dark:text-white cursor-pointer"
                                >
                                  {service.name}
                                </Label>
                                {service.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {service.description}
                                  </p>
                                )}
                                {service.locationTypes && service.locationTypes.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {service.locationTypes.includes(LocationType.HOME) && (
                                      <Badge variant="outline" className="text-xs">
                                        <Home className="w-3 h-3 mr-1" />
                                        Home
                                      </Badge>
                                    )}
                                    {service.locationTypes.includes(LocationType.CLINIC) && (
                                      <Badge variant="outline" className="text-xs">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        Clinic
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </div>
                )}

                {/* Step 4: Location Selection */}
                {currentStep === 'location' &&
                  selectedService &&
                  availableLocationTypes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Choose Location</h2>
                      </div>

                      {availableLocationTypes.length === 1 ? (
                        <div className="space-y-4">
                          {availableLocationTypes[0] === LocationType.HOME ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Home className="w-5 h-5 text-primary" />
                                <span className="font-medium">Home Visit</span>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="home-address" className="text-sm font-medium">
                                  Your Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="home-address"
                                  placeholder="Enter your full address (street, city, postal code)"
                                  value={homeAddress}
                                  onChange={(e) => setHomeAddress(e.target.value)}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Required for home visit bookings
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span className="font-medium">At Clinic</span>
                              </div>
                              {selectedSlotData?.slot?.location?.address && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {selectedSlotData.slot.location.address}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <RadioGroup
                            value={locationType || undefined}
                            onValueChange={(value) => {
                              setLocationType(value as LocationType);
                              if (value === LocationType.CLINIC) {
                                setHomeAddress('');
                              }
                            }}
                            className="space-y-4"
                          >
                            {availableLocationTypes.includes(LocationType.HOME) && (
                              <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <RadioGroupItem
                                  value={LocationType.HOME}
                                  id="home"
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor="home"
                                    className="font-medium cursor-pointer flex items-center gap-2"
                                  >
                                    <Home className="w-5 h-5" />
                                    At Home
                                  </Label>
                                </div>
                              </div>
                            )}

                            {availableLocationTypes.includes(LocationType.CLINIC) && (
                              <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <RadioGroupItem
                                  value={LocationType.CLINIC}
                                  id="clinic"
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor="clinic"
                                    className="font-medium cursor-pointer flex items-center gap-2"
                                  >
                                    <Building2 className="w-5 h-5" />
                                    At Clinic
                                  </Label>
                                  {selectedSlotData?.slot?.location?.address && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                      {selectedSlotData.slot.location.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </RadioGroup>

                          {/* Address field - always visible when HOME is an option */}
                          {availableLocationTypes.includes(LocationType.HOME) && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <Label
                                htmlFor="home-address"
                                className="text-sm font-medium mb-2 block"
                              >
                                Your Address{' '}
                                {locationType === LocationType.HOME && (
                                  <span className="text-red-500">*</span>
                                )}
                              </Label>
                              <Input
                                id="home-address"
                                placeholder="Enter your full address (street, city, postal code)"
                                value={homeAddress}
                                onChange={(e) => setHomeAddress(e.target.value)}
                                className="mt-1"
                              />
                              {locationType === LocationType.HOME && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Required for home visit bookings. We'll use this address for the
                                  therapist to visit you.
                                </p>
                              )}
                              {locationType !== LocationType.HOME && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  This address will be used if you select "At Home" location.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* Step 5: Booking Summary */}
                {currentStep === 'summary' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">Review & Confirm</h2>
                    </div>

                    <div className="space-y-4">
                      {selectedSlotData && (
                        <>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Therapist:</span>
                              <span className="font-medium">
                                {selectedSlotData.freelancer?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                              <span className="font-medium">
                                {format(parseISO(selectedSlotData.slot.startTime), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Services:</span>
                              <span className="font-medium text-right">
                                {selectedServiceData ? selectedServiceData.name : 'None selected'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Location:</span>
                              <span className="font-medium">
                                {locationType === LocationType.HOME ? 'At Home' : 'At Clinic'}
                              </span>
                            </div>
                            {locationType === LocationType.HOME && homeAddress && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                                <strong>Address:</strong> {homeAddress}
                              </div>
                            )}
                            {locationType === LocationType.CLINIC &&
                              selectedSlotData.slot.location?.address && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                                  <strong>Clinic:</strong> {selectedSlotData.slot.location.address}
                                </div>
                              )}
                            <div className="flex justify-between pt-3 border-t">
                              <span className="font-semibold text-lg">Total:</span>
                              <span className="text-2xl font-bold text-primary">
                                €{selectedSlotData.slot.basePrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={handleConfirm}
                            disabled={isCreating}
                            className="w-full"
                            size="lg"
                          >
                            {isCreating ? 'Booking...' : 'Confirm Booking'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  {currentStep !== 'summary' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={!canGoPrevious()}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!canGoNext()}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={!canGoPrevious()}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show message if no date selected */}
          {!selectedDate && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold text-lg mb-2">Select a Date</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a date from the calendar above to continue
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Your Address</DialogTitle>
            <DialogDescription>
              Please provide your full address for the home visit booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-address">Your Address</Label>
              <Input
                id="dialog-address"
                placeholder="Enter your full address (street, city, postal code)"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tempAddress.trim()) {
                    handleSaveAddress();
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Location: At Home</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddressDialog(false);
                setTempAddress('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={!tempAddress.trim()}>
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
}
