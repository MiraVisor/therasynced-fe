'use client';

import { format, parseISO, startOfToday } from 'date-fns';
import {
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Home,
  MapPin,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { ExpertCardContent } from '@/components/core/Dashboard/UserSide/Overview/ExpertCardContent';
import { ExpertProfileDialog } from '@/components/core/Dashboard/UserSide/Overview/ExpertProfileDialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useProfile, useUpdateProfile } from '@/hooks/queries/useProfile';
import { useAvailableSlots, useAvailableSlotsByDate } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { searchFreelancersAutocomplete } from '@/services/freelancerService';
import { getApiErrorMessage } from '@/types/common';
import { LocationType } from '@/types/enums';
import { Expert } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

type BookingMode = 'search' | 'freelancer' | 'date';
type Step = 'therapist' | 'time' | 'services' | 'location' | 'summary';

export default function BookingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<BookingMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Expert[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [selectedFreelancerData, setSelectedFreelancerData] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [homeAddress, setHomeAddress] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('therapist');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileFreelancer, setProfileFreelancer] = useState<Expert | null>(null);

  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const { data: userProfile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();

  // Pre-populate address from user profile (only when no slot is selected and no address is set)
  useEffect(() => {
    if (!selectedSlot && !homeAddress && userProfile?.homeAddress) {
      setHomeAddress(userProfile.homeAddress);
    }
  }, [userProfile, selectedSlot, homeAddress]);

  const today = startOfToday();

  // Fetch slots for calendar indicators
  const { data: allSlotsByDate = [] } = useAvailableSlotsByDate({
    date: format(today, 'yyyy-MM-dd'),
    limit: 1000,
  });

  // Get slots for selected date
  const { data: slotsForDate = [], isLoading: isLoadingSlotsForDate } = useAvailableSlotsByDate({
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    limit: 100,
  });

  // Search freelancers by name (autocomplete)
  const handleSearchInput = async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await searchFreelancersAutocomplete(value, 8);
      if (response.success && response.data) {
        const mapped = response.data.map(mapOneFreelancerToExpert);
        setSearchSuggestions(mapped);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
    }
  };

  // Handle freelancer selection from search
  const handleSelectFreelancer = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer.id);
    setSelectedFreelancerData(freelancer);
    setSearchQuery('');
    setShowSuggestions(false);
    setMode('freelancer');
    // Reset other selections
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    // If date already selected, go to time step, otherwise stay at calendar
    if (selectedDate) {
      setCurrentStep('time');
    } else {
      setCurrentStep('therapist'); // This will show calendar in search mode
    }
  };

  // Handle date selection in date-first mode
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedFreelancer(null);
    setSelectedFreelancerData(null);
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setCurrentStep('therapist');
    setMode('date');
  };

  // Get unique freelancers with slots for selected date
  const freelancersWithSlots = useMemo(() => {
    if (!selectedDate || !slotsForDate.length) return [];

    const freelancersMap = new Map<string, Expert>();

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
          cardInfo: {
            name: slot.freelancerName || 'Unknown',
            averageRating: slot.averageRating || 0,
            totalRatings: slot.numberOfRatings || 0,
          },
        } as Expert);
      }
    });

    return Array.from(freelancersMap.values());
  }, [selectedDate, slotsForDate]);

  // Get slots for selected freelancer and date
  const { data: freelancerSlots = [], isLoading: isLoadingFreelancerSlots } = useAvailableSlots(
    selectedFreelancer ?? null,
    {
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    },
  );

  // Get available slots for selected date (all freelancers)
  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return slotsForDate.filter((slot) => {
      const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return slotDate === selectedDateStr && slot.status === 'AVAILABLE';
    });
  }, [selectedDate, slotsForDate]);

  // Get selected slot data
  const selectedSlotData = useMemo(() => {
    if (!selectedSlot) return null;
    // Check in all possible slot arrays to find the selected slot with full data
    // Priority: freelancerSlots > availableSlotsForDate > slotsForDate
    const allSlots = [...freelancerSlots, ...availableSlotsForDate, ...slotsForDate];
    // Remove duplicates by ID, keeping first occurrence
    const uniqueSlots = Array.from(new Map(allSlots.map((slot) => [slot.id, slot])).values());
    const foundSlot = uniqueSlots.find((s) => s.id === selectedSlot);
    return foundSlot || null;
  }, [selectedSlot, freelancerSlots, availableSlotsForDate, slotsForDate]);

  // Update home address based on selected slot data
  useEffect(() => {
    if (selectedSlotData) {
      const slotHomeAddress = (selectedSlotData as any)?.homeAddress;
      // If slot explicitly has null, clear the home address
      if (slotHomeAddress === null) {
        setHomeAddress('');
      } else if (slotHomeAddress && typeof slotHomeAddress === 'string' && slotHomeAddress.trim()) {
        // If slot has a valid home address value, use it
        setHomeAddress(slotHomeAddress);
      }
    }
  }, [selectedSlotData]);

  // Get available services from selected slot
  const availableServices = useMemo(() => {
    return selectedSlotData?.availableServiceCategories || [];
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
    if (availableLocationTypes.length === 1 && !locationType) {
      setLocationType(availableLocationTypes[0] || null);
    }
  }, [availableLocationTypes, locationType]);

  // Handle slot selection
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setCurrentStep('services');
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService((prev) => (prev === serviceId ? '' : serviceId));
    setLocationType(null);
    setHomeAddress('');
  };

  // Handle therapist selection in date-first mode
  const handleTherapistSelect = (freelancerId: string) => {
    const freelancer = freelancersWithSlots.find((f) => f.id === freelancerId);
    if (freelancer) {
      setSelectedFreelancer(freelancerId);
      setSelectedFreelancerData(freelancer);
      // Filter slots for this freelancer
      const slots = availableSlotsForDate.filter((s) => s.freelancerId === freelancerId);
      if (slots.length > 0) {
        setCurrentStep('time');
      }
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 'therapist') {
      // In freelancer mode, move to time after date is selected
      // In date mode, move to time after freelancer is selected
      if (mode === 'freelancer' && selectedDate) {
        setCurrentStep('time');
      } else if (mode === 'date' && selectedFreelancer) {
        setCurrentStep('time');
      }
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
      setCurrentStep('location');
    }
  };

  const canGoNext = () => {
    if (currentStep === 'therapist') {
      // In freelancer mode, need date selected; in date mode, need freelancer selected
      if (mode === 'freelancer') return !!selectedDate;
      return !!selectedFreelancer;
    }
    if (currentStep === 'time') return !!selectedSlot;
    if (currentStep === 'services') return !!selectedService;
    if (currentStep === 'location') return !!locationType;
    return false;
  };

  const canGoPrevious = () => {
    return currentStep !== 'therapist';
  };

  // Get dates with slots for calendar
  const datesWithSlots = useMemo(() => {
    const dateSet = new Set<string>();
    allSlotsByDate.forEach((slot) => {
      const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      dateSet.add(date);
    });
    return dateSet;
  }, [allSlotsByDate]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedSlotData) return 0;

    // If service is selected and has location-specific pricing, use that
    if (selectedServiceData && locationType) {
      const servicePricing = (selectedServiceData as any).pricing;
      if (servicePricing?.[locationType]?.price) {
        return Number(servicePricing[locationType].price) ?? 0;
      }
    }

    // Fallback to base price with additional fees
    let price = selectedSlotData.basePrice ?? 0;
    if (selectedSlotData.location?.additionalFee && locationType === LocationType.CLINIC) {
      price += selectedSlotData.location.additionalFee;
    }
    return price;
  }, [selectedSlotData, selectedServiceData, locationType]);

  // Booking confirmation
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
      setTempAddress(homeAddress);
      setShowAddressDialog(true);
      return;
    }
    proceedWithBooking();
  };

  const handleSaveAddress = () => {
    if (tempAddress.trim()) {
      const addressToSave = tempAddress.trim();
      setHomeAddress(addressToSave);
      setShowAddressDialog(false);
      setTempAddress('');

      if (userProfile && userProfile.homeAddress !== addressToSave) {
        updateProfile(
          { homeAddress: addressToSave },
          {
            onError: () => {
              console.warn('Failed to save address to profile');
            },
          },
        );
      }

      proceedWithBooking();
    } else {
      toast.error('Please enter a valid address');
    }
  };

  // Show profile dialog
  const handleViewProfile = (freelancer: Expert) => {
    setProfileFreelancer(freelancer);
    setShowProfileDialog(true);
  };

  // Get slots for current view
  const slotsToShow = useMemo(() => {
    if (mode === 'freelancer' && selectedFreelancer && selectedDate) {
      // Use freelancerSlots if available, otherwise fall back to slotsForDate filtered by freelancer
      if (freelancerSlots.length > 0) {
        return freelancerSlots.filter((slot) => {
          const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
          const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
          return slotDate === selectedDateStr && slot.status === 'AVAILABLE';
        });
      }
      // Fallback to slotsForDate if freelancerSlots is empty
      return slotsForDate.filter((slot) => {
        const slotDate = format(parseISO(slot.startTime), 'yyyy-MM-dd');
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        return (
          slotDate === selectedDateStr &&
          slot.freelancerId === selectedFreelancer &&
          slot.status === 'AVAILABLE'
        );
      });
    }
    if (mode === 'date' && selectedDate) {
      if (selectedFreelancer) {
        return availableSlotsForDate.filter((s) => s.freelancerId === selectedFreelancer);
      }
      return availableSlotsForDate;
    }
    return [];
  }, [
    mode,
    selectedFreelancer,
    selectedDate,
    freelancerSlots,
    availableSlotsForDate,
    slotsForDate,
  ]);

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
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-charcoal dark:text-white mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search by therapist name or browse available dates
            </p>
          </div>

          {/* Mode Selection Tabs */}
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as BookingMode);
              if (value === 'search') {
                setSelectedFreelancer(null);
                setSelectedFreelancerData(null);
                setSelectedDate(null);
                setSelectedSlot(null);
                setCurrentStep('therapist');
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search by Therapist</TabsTrigger>
              <TabsTrigger value="date">Browse by Date</TabsTrigger>
            </TabsList>

            {/* Search by Therapist Mode */}
            <TabsContent value="search" className="mt-6">
              {/* Empty - content moved to grid */}
            </TabsContent>

            {/* Browse by Date Mode */}
            <TabsContent value="date" className="mt-6">
              {/* Empty - content moved to grid */}
            </TabsContent>
          </Tabs>

          {/* 2-Column Grid Layout: Date (Left) | Steps (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            {/* Left Column: Date Selection */}
            <div className="flex flex-col h-full">
              <Card className="flex-1 flex flex-col overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col overflow-y-auto h-full">
                  {/* Search by Therapist Mode - Search Input */}
                  {mode === 'search' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label className="text-base font-semibold mb-2 block">
                          Search Therapist by Name
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="text"
                            placeholder="Type therapist name..."
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="pl-10"
                            onFocus={() => {
                              if (searchSuggestions.length > 0) setShowSuggestions(true);
                            }}
                          />
                          {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                              {searchSuggestions.map((freelancer) => (
                                <div
                                  key={freelancer.id}
                                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                                  onClick={() => handleSelectFreelancer(freelancer)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={
                                          freelancer.profilePicture || freelancer.cardInfo?.initials
                                        }
                                      />
                                      <AvatarFallback>
                                        {freelancer.name?.charAt(0) || 'T'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-charcoal dark:text-white truncate">
                                        {freelancer.name || freelancer.cardInfo?.name}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {freelancer.jobTitle?.name || freelancer.cardInfo?.title}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewProfile(freelancer);
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected Freelancer Info */}
                      {selectedFreelancerData && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={
                                    selectedFreelancerData.profilePicture ||
                                    selectedFreelancerData.cardInfo?.initials
                                  }
                                />
                                <AvatarFallback>
                                  {selectedFreelancerData.name?.charAt(0) || 'T'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-charcoal dark:text-white">
                                  {selectedFreelancerData.name ||
                                    selectedFreelancerData.cardInfo?.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedFreelancerData.jobTitle?.name ||
                                    selectedFreelancerData.cardInfo?.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewProfile(selectedFreelancerData)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedFreelancer(null);
                                  setSelectedFreelancerData(null);
                                  setSearchQuery('');
                                }}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date Selection Calendar */}
                  <div className="flex-1 flex flex-col">
                    <Label className="text-base font-semibold mb-2 block">
                      {mode === 'search' && selectedFreelancerData
                        ? `Select Date for ${selectedFreelancerData.name || 'Therapist'}`
                        : 'Select Date'}
                    </Label>
                    <div className="border rounded-lg p-4 flex justify-center items-start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate || undefined}
                        onSelect={(date) => {
                          if (date) {
                            if (mode === 'date') {
                              handleDateSelect(date);
                            } else {
                              setSelectedDate(date);
                              setSelectedSlot(null);
                              setCurrentStep('time');
                            }
                          }
                        }}
                        disabled={(date) => date < today}
                        modifiers={
                          mode === 'date'
                            ? {
                                hasSlots: (date) => {
                                  const dateStr = format(date, 'yyyy-MM-dd');
                                  return datesWithSlots.has(dateStr);
                                },
                              }
                            : undefined
                        }
                        modifiersClassNames={
                          mode === 'date'
                            ? {
                                hasSlots:
                                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                              }
                            : undefined
                        }
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Booking Steps */}
            <div className="flex flex-col h-full overflow-hidden">
              <Card className="flex-1 flex flex-col overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col overflow-y-auto h-full">
                  {/* Dynamic Booking Steps */}
                  {!(selectedDate || selectedFreelancer) ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          {mode === 'search'
                            ? 'Search for a therapist and select a date to continue'
                            : 'Select a date to see available appointments'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Step 1: Therapist Selection (Date-first mode) */}
                      {currentStep === 'therapist' && mode === 'date' && selectedDate && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-lg">
                              Select Therapist - {format(selectedDate, 'EEEE, MMMM d')}
                            </h2>
                          </div>
                          {isLoadingSlotsForDate ? (
                            <div className="flex justify-center items-center py-8">
                              <LoadingSpinner size="lg" />
                            </div>
                          ) : freelancersWithSlots.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-600 dark:text-gray-400">
                                No therapists available on this date
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {freelancersWithSlots.map((freelancer) => {
                                const slotsCount = availableSlotsForDate.filter(
                                  (s) => s.freelancerId === freelancer.id,
                                ).length;
                                const expertData = mapOneFreelancerToExpert(freelancer);
                                return (
                                  <div
                                    key={freelancer.id}
                                    className={cn(
                                      'cursor-pointer transition-all',
                                      selectedFreelancer === freelancer.id
                                        ? 'ring-2 ring-primary rounded-lg'
                                        : '',
                                    )}
                                    onClick={() => handleTherapistSelect(freelancer.id)}
                                  >
                                    <ExpertCardContent
                                      id={expertData.id}
                                      name={expertData.name}
                                      rating={expertData.rating}
                                      isFavorite={expertData.isFavorite}
                                      services={expertData.services}
                                      availableSlots={slotsCount}
                                      cardInfo={expertData.cardInfo}
                                      slots={[]}
                                      verificationStatus={expertData.verificationStatus}
                                      tier={expertData.tier}
                                      planFeatures={expertData.planFeatures}
                                      stampInfo={expertData.stampInfo}
                                      onViewProfile={() => handleViewProfile(freelancer)}
                                      showBookNow={false}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 2: Time Slot Selection */}
                      {currentStep === 'time' && (selectedDate || selectedFreelancer) && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-lg">
                              {selectedDate
                                ? `Available Times - ${format(selectedDate, 'EEEE, MMMM d')}`
                                : 'Select Time'}
                              {selectedFreelancerData && (
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                  with {selectedFreelancerData.name}
                                </span>
                              )}
                            </h2>
                          </div>
                          {isLoadingFreelancerSlots && selectedFreelancer ? (
                            <div className="flex justify-center items-center py-8">
                              <LoadingSpinner size="lg" />
                            </div>
                          ) : !selectedDate ? (
                            <div className="text-center py-8">
                              <p className="text-gray-600 dark:text-gray-400">
                                Please select a date from the calendar above
                              </p>
                            </div>
                          ) : slotsToShow.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-600 dark:text-gray-400">
                                No available slots for this selection
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Try selecting a different date
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {slotsToShow.map((slot) => {
                                const slotDate = parseISO(slot.startTime);
                                const isSelected = selectedSlot === slot.id;
                                return (
                                  <Button
                                    key={slot.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSlotSelect(slot.id)}
                                    className={cn(
                                      'h-12',
                                      isSelected
                                        ? 'bg-primary text-white'
                                        : 'hover:border-primary hover:text-primary',
                                    )}
                                  >
                                    {format(slotDate, 'h:mm a')}
                                  </Button>
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
                            <h2 className="font-semibold text-lg">Select Service</h2>
                          </div>
                          {availableServices.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-600 dark:text-gray-400">
                                No services available for this slot
                              </p>
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
                                    <RadioGroupItem
                                      id={service.id}
                                      value={service.id}
                                      className="mt-1"
                                    />
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
                                      {service.locationTypes &&
                                        service.locationTypes.length > 0 && (
                                          <div className="flex items-center gap-2 mt-2">
                                            {service.locationTypes.includes(LocationType.HOME) && (
                                              <Badge variant="outline" className="text-xs">
                                                <Home className="w-3 h-3 mr-1" />
                                                Home
                                              </Badge>
                                            )}
                                            {service.locationTypes.includes(
                                              LocationType.CLINIC,
                                            ) && (
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
                        selectedSlot &&
                        selectedService &&
                        availableLocationTypes.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="w-5 h-5 text-primary" />
                              <h2 className="font-semibold text-lg">Choose Location</h2>
                            </div>
                            <RadioGroup
                              value={locationType || undefined}
                              onValueChange={(value) => {
                                setLocationType(value as LocationType);
                                if (value === LocationType.CLINIC) {
                                  setHomeAddress('');
                                }
                              }}
                              className="space-y-3"
                            >
                              {availableLocationTypes.includes(LocationType.HOME) && (
                                <div
                                  className={cn(
                                    'flex items-start gap-3 p-4 border rounded-lg transition-all cursor-pointer',
                                    locationType === LocationType.HOME
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
                                  )}
                                  onClick={() => setLocationType(LocationType.HOME)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setLocationType(LocationType.HOME);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <RadioGroupItem
                                    value={LocationType.HOME}
                                    id="home"
                                    className="mt-1"
                                  />
                                  <div className="flex-1 flex items-center justify-between">
                                    <div>
                                      <Label
                                        htmlFor="home"
                                        className="font-medium cursor-pointer flex items-center gap-2"
                                      >
                                        <Home className="w-5 h-5" />
                                        At Home
                                      </Label>
                                    </div>
                                    {selectedServiceData &&
                                      (selectedServiceData as any).pricing?.HOME && (
                                        <div className="text-right">
                                          <p className="font-semibold text-primary">
                                            €
                                            {Number(
                                              (selectedServiceData as any).pricing.HOME.price ?? 0,
                                            ).toFixed(2)}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(selectedServiceData as any).pricing.HOME.currency ??
                                              'EUR'}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                              {availableLocationTypes.includes(LocationType.CLINIC) && (
                                <div
                                  className={cn(
                                    'flex items-start gap-3 p-4 border rounded-lg transition-all cursor-pointer',
                                    locationType === LocationType.CLINIC
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
                                  )}
                                  onClick={() => setLocationType(LocationType.CLINIC)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setLocationType(LocationType.CLINIC);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <RadioGroupItem
                                    value={LocationType.CLINIC}
                                    id="clinic"
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label
                                        htmlFor="clinic"
                                        className="font-medium cursor-pointer flex items-center gap-2"
                                      >
                                        <Building2 className="w-5 h-5" />
                                        At Clinic
                                      </Label>
                                      {selectedServiceData &&
                                        (selectedServiceData as any).pricing?.CLINIC && (
                                          <div className="text-right">
                                            <p className="font-semibold text-primary">
                                              €
                                              {Number(
                                                (selectedServiceData as any).pricing.CLINIC.price ??
                                                  0,
                                              ).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {(selectedServiceData as any).pricing.CLINIC
                                                .currency ?? 'EUR'}
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                    {locationType === LocationType.CLINIC && (
                                      <div className="mt-2">
                                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                          Clinic Address
                                        </Label>
                                        <Input
                                          value={
                                            (selectedSlotData as any)?.clinicAddress ||
                                            selectedSlotData?.location?.address ||
                                            (selectedFreelancerData as any)?.clinicAddress ||
                                            'Clinic address not available'
                                          }
                                          disabled
                                          className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                          readOnly
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </RadioGroup>

                            {/* Address Input for Home Visits */}
                            {availableLocationTypes.includes(LocationType.HOME) && (
                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                  placeholder={
                                    locationType === LocationType.HOME
                                      ? 'Enter your full address (street, city, postal code)'
                                      : 'Select "At Home" to enter your address'
                                  }
                                  value={homeAddress}
                                  onChange={(e) => setHomeAddress(e.target.value)}
                                  disabled={locationType !== LocationType.HOME}
                                  className={cn(
                                    'mt-1',
                                    locationType !== LocationType.HOME &&
                                      'bg-gray-100 dark:bg-gray-900 cursor-not-allowed',
                                  )}
                                />
                                {locationType === LocationType.HOME && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Required for home visit bookings
                                    </p>
                                    {!homeAddress.trim() && (
                                      <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Please enter your address to continue with the booking
                                      </p>
                                    )}
                                  </div>
                                )}
                                {locationType !== LocationType.HOME && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Select "At Home" to enter your address
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Step 5: Summary */}
                      {currentStep === 'summary' && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-lg">Review & Confirm</h2>
                          </div>
                          <div className="space-y-4">
                            {selectedFreelancerData && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Therapist:</span>
                                <span className="font-medium">
                                  {selectedFreelancerData.name ||
                                    selectedFreelancerData.cardInfo?.name}
                                </span>
                              </div>
                            )}
                            {selectedDate && selectedSlotData && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Date & Time:
                                </span>
                                <span className="font-medium">
                                  {format(parseISO(selectedSlotData.startTime), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            )}
                            {selectedServiceData && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                                <span className="font-medium">{selectedServiceData.name}</span>
                              </div>
                            )}
                            {locationType && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="font-medium">
                                  {locationType === LocationType.HOME ? 'At Home' : 'At Clinic'}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-4 border-t">
                              <span>Total:</span>
                              <span className="text-primary">€{totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirm}
                            disabled={
                              isCreating ||
                              (locationType === LocationType.HOME && !homeAddress.trim())
                            }
                            className="w-full mt-6"
                            size="lg"
                          >
                            {isCreating ? 'Confirming...' : 'Confirm Booking'}
                          </Button>
                          {locationType === LocationType.HOME && !homeAddress.trim() && (
                            <p className="text-sm text-red-500 mt-2 text-center">
                              Please enter your address to continue
                            </p>
                          )}
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
                    </div>
                  )}
                </CardContent>
              </Card>
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

          {/* Profile Dialog */}
          {profileFreelancer && (
            <ExpertProfileDialog
              isOpen={showProfileDialog}
              onClose={() => {
                setShowProfileDialog(false);
                setProfileFreelancer(null);
              }}
              expert={{
                id: profileFreelancer.id,
                name: profileFreelancer.name,
                jobTitle: profileFreelancer.jobTitle,
                rating: profileFreelancer.rating,
                description: profileFreelancer.description,
                services: profileFreelancer.services,
                sessionTypes: profileFreelancer.sessionTypes,
                pricing: profileFreelancer.pricing,
                availableSlots: profileFreelancer.availableSlots,
                cardInfo: profileFreelancer.cardInfo,
                verificationStatus: profileFreelancer.verificationStatus,
                firstAidCertificateStatus: profileFreelancer.firstAidCertificateStatus,
                onBookNow: () => {
                  setShowProfileDialog(false);
                  if (profileFreelancer) {
                    handleSelectFreelancer(profileFreelancer);
                  }
                },
                hasAvailableSlots: true,
                stampInfo: profileFreelancer.stampInfo || undefined,
                durationPricing: (profileFreelancer as any)?.durationPricing,
                serviceCategoryPricing: (profileFreelancer as any)?.serviceCategoryPricing,
              }}
            />
          )}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
