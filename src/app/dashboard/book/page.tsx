'use client';

import { format, parseISO, startOfToday } from 'date-fns';
import {
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Home,
  MapPin,
  Search,
  Sparkles,
  Stamp,
  Star,
  User,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { ExpertProfileDialog } from '@/components/core/Dashboard/UserSide/Overview/ExpertProfileDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/ui/tier-badge';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useFavoriteFreelancers } from '@/hooks/queries/useFreelancers';
import { useProfile, useUpdateProfile } from '@/hooks/queries/useProfile';
import { useAvailableSlotsByDate, useFreelancersByDate } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { searchFreelancersAutocomplete } from '@/services/freelancerService';
import { getApiErrorMessage } from '@/types/common';
import { LocationType } from '@/types/enums';
import { Expert } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

type BookingFlow = 'initial' | 'therapist-selected' | 'date-selected' | 'booking';
type BookingStep = 'time' | 'service' | 'location' | 'confirm';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core state
  const [flow, setFlow] = useState<BookingFlow>('initial');
  const [bookingStep, setBookingStep] = useState<BookingStep>('time');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Expert[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFavorites, setShowFavorites] = useState(false);

  // Selection state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [selectedFreelancerData, setSelectedFreelancerData] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [homeAddress, setHomeAddress] = useState('');

  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileFreelancer, setProfileFreelancer] = useState<Expert | null>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const { data: userProfile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const { data: favoriteFreelancers = [], isLoading: isLoadingFavorites } =
    useFavoriteFreelancers();

  const today = startOfToday();

  // Get freelancers who have available slots on the selected date
  const { data: freelancersByDate = [], isLoading: isLoadingFreelancersByDate } =
    useFreelancersByDate({
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      limit: 100,
    });

  // Get slots for selected freelancer and date (now requires both)
  const { data: freelancerSlots = [], isLoading: isLoadingFreelancerSlots } =
    useAvailableSlotsByDate({
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      freelancerId: selectedFreelancer ?? '',
      limit: 100,
    });

  // Pre-populate address from user profile
  useEffect(() => {
    if (!selectedSlot && !homeAddress && userProfile?.homeAddress) {
      setHomeAddress(userProfile.homeAddress);
    }
  }, [userProfile, selectedSlot, homeAddress]);

  // Handle freelancer pre-selection from query params
  useEffect(() => {
    const freelancerParam = searchParams.get('freelancer');
    if (freelancerParam && !selectedFreelancer) {
      try {
        const freelancerData = JSON.parse(decodeURIComponent(freelancerParam)) as Expert;
        if (freelancerData.id) {
          setSelectedFreelancer(freelancerData.id);
          setSelectedFreelancerData(freelancerData);
          setFlow('therapist-selected');
          // Clear the query param to avoid re-triggering
          router.replace('/dashboard/book', { scroll: false });
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [searchParams, selectedFreelancer, router]);

  // Debounced search
  const handleSearchInput = useCallback(async (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchFreelancersAutocomplete(value, 8);
        if (response.success && response.data) {
          const mapped = response.data.map(mapOneFreelancerToExpert);
          setSearchSuggestions(mapped);
          setShowSuggestions(mapped.length > 0);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Handle keyboard navigation in search dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchSuggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchSuggestions[selectedIndex]) {
          handleSelectFreelancer(searchSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle freelancer selection from search
  const handleSelectFreelancer = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer.id);
    setSelectedFreelancerData(freelancer);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setFlow('therapist-selected');
    // Reset other selections
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    // Scroll to selected freelancer banner after a short delay
    setTimeout(() => {
      const banner = document.getElementById('selected-freelancer-banner');
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    setBookingStep('time');

    if (selectedFreelancerData) {
      setFlow('booking');
    } else {
      setFlow('date-selected');
    }
  };

  // Get freelancers with available slots for selected date (from new endpoint)
  const freelancersWithSlots = useMemo(() => {
    if (!selectedDate || !freelancersByDate.length) return [];

    // Map the freelancers from the API response to Expert format
    return freelancersByDate.map((freelancer) => {
      // Handle jobTitle - it might be a string or an object
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
        jobTitle: { id: '', name: jobTitleName },
        cardInfo: {
          name: freelancer.name || '',
          averageRating: freelancer.rating || 0,
          totalRatings: 0,
        },
        slotCount: 1, // API doesn't return slot count, defaulting to 1
      };
    }) as (Expert & { slotCount: number })[];
  }, [selectedDate, freelancersByDate]);

  // Handle therapist selection from date-first flow
  const handleTherapistSelect = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer.id);
    setSelectedFreelancerData(freelancer);
    setFlow('booking');
    setBookingStep('time');
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (bookingStep === 'time' && selectedSlot) {
      setBookingStep('service');
    } else if (bookingStep === 'service' && selectedService) {
      setBookingStep('location');
    } else if (bookingStep === 'location') {
      // Validate location selection and address if HOME is selected
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
    if (bookingStep === 'time') {
      // Go back to freelancer selection
      setSelectedFreelancer(null);
      setSelectedFreelancerData(null);
      setSelectedSlot(null);
      setFlow('date-selected');
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

  const canGoNext = () => {
    if (bookingStep === 'time') return !!selectedSlot;
    if (bookingStep === 'service') return !!selectedService;
    if (bookingStep === 'location') {
      // Must have location selected, and if HOME, must have address
      return !!locationType && (locationType !== LocationType.HOME || !!homeAddress.trim());
    }
    return false;
  };

  const canGoPrevious = () => {
    // Can always go back, even from time step
    return true;
  };

  // Get available slots for display (now requires both date and freelancer)
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
          { onError: () => console.warn('Failed to save address to profile') },
        );
      }

      proceedWithBooking();
    } else {
      toast.error('Please enter a valid address');
    }
  };

  // Reset flow
  const handleReset = () => {
    setFlow('initial');
    setSelectedDate(null);
    setSelectedFreelancer(null);
    setSelectedFreelancerData(null);
    setSelectedSlot(null);
    setSelectedService('');
    setLocationType(null);
    setHomeAddress('');
    setSearchQuery('');
  };

  // View profile
  const handleViewProfile = (freelancer: Expert) => {
    setProfileFreelancer(freelancer);
    setShowProfileDialog(true);
  };

  // Success state
  if (showSuccess) {
    return (
      <DashboardPageWrapper>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="max-w-md w-full border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-mint/30 dark:from-green-900/30 dark:to-mint/20 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-poppins font-bold text-charcoal dark:text-white mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-inter">
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
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-mint/5 via-white to-primary/5 dark:from-mint/10 dark:via-gray-900 dark:to-primary/10 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-charcoal dark:text-white mb-4">
              Find Your Freelancer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-inter max-w-2xl mx-auto">
              Search by name or browse available dates to find the perfect match for your
              wellnessjourney
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Main Search Section */}
          <div className="space-y-8">
            {/* Search/Favorites Toggle */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={!showFavorites ? 'default' : 'outline'}
                  onClick={() => {
                    setShowFavorites(false);
                    setShowSuggestions(false);
                  }}
                  className="flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant={showFavorites ? 'default' : 'outline'}
                  onClick={() => {
                    setShowFavorites(true);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites ({favoriteFreelancers.length})
                </Button>
              </div>
            </div>

            {/* Search Bar or Favorites List */}
            {!showFavorites ? (
              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search freelancers by name..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="pl-12 pr-4 py-4 text-lg border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Dropdown */}
                {showSuggestions && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-[400px] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
                  >
                    {isSearching ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchSuggestions.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          No freelancers found
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <ul className="py-2" role="listbox">
                        {searchSuggestions.map((freelancer, index) => (
                          <li
                            key={freelancer.id}
                            role="option"
                            aria-selected={selectedIndex === index}
                            className={cn(
                              'px-4 py-3 cursor-pointer transition-all duration-150',
                              selectedIndex === index
                                ? 'bg-primary/10 dark:bg-primary/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                            )}
                            onClick={() => handleSelectFreelancer(freelancer)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-primary/20">
                                <ProfileAvatarImage
                                  src={freelancer.profilePicture || undefined}
                                  alt={freelancer.name || 'Freelancer'}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-mint/20 text-primary font-semibold text-base">
                                  {freelancer.name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {freelancer.name}
                                  </span>
                                  <VerificationBadge
                                    status={freelancer.verificationStatus || 'unverified'}
                                    size="sm"
                                  />
                                  {freelancer.tier && (
                                    <TierBadge tier={freelancer.tier} size="sm" showIcon={true} />
                                  )}
                                </div>
                                {freelancer.specialty && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {freelancer.specialty}
                                  </p>
                                )}
                                {freelancer.rating !== undefined && freelancer.rating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {freelancer.rating.toFixed(1)}
                                      {freelancer.reviews > 0 && ` (${freelancer.reviews})`}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Arrow */}
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
                  {isLoadingFavorites ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : favoriteFreelancers.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        No favorite freelancers yet
                      </p>
                      <Button variant="outline" onClick={() => setShowFavorites(false)}>
                        Search Freelancers
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Select a favorite freelancer to book with
                      </p>
                      {favoriteFreelancers.map((freelancer) => {
                        const expert = mapOneFreelancerToExpert(freelancer);
                        const isSelected = selectedFreelancer === expert.id;
                        const { stampInfo } = expert;
                        return (
                          <div
                            key={expert.id}
                            onClick={() => handleSelectFreelancer(expert)}
                            className={cn(
                              'p-4 border rounded-lg cursor-pointer transition-all duration-200',
                              isSelected
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="w-12 h-12 flex-shrink-0">
                                  <ProfileAvatarImage
                                    src={expert.profilePicture || undefined}
                                    alt={expert.name || 'Freelancer'}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {expert.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                      {expert.name}
                                    </p>
                                    <VerificationBadge
                                      status={expert.verificationStatus || 'unverified'}
                                      size="sm"
                                    />
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {expert.jobTitle?.name || 'Freelancer'}
                                  </p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <RatingDisplay
                                      rating={expert.rating ?? expert.cardInfo?.averageRating}
                                      reviewCount={
                                        expert.cardInfo?.totalRatings ?? expert.reviews ?? 0
                                      }
                                      size="sm"
                                      showCount={true}
                                    />
                                    {stampInfo && (
                                      <div className="flex items-center gap-1.5">
                                        {(() => {
                                          const target = stampInfo.stampTarget ?? 5;
                                          const currentCount = Number(
                                            stampInfo.currentStampCount ?? 0,
                                          );
                                          const maxCount = Math.min(currentCount, target);
                                          return Array.from(
                                            { length: Math.min(target, 5) },
                                            (_, index) => {
                                              const isFilled = index < maxCount;
                                              return (
                                                <div
                                                  key={index}
                                                  className={cn(
                                                    'flex items-center justify-center w-4 h-4 rounded-full border',
                                                    isFilled
                                                      ? 'bg-primary border-primary text-white'
                                                      : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600',
                                                  )}
                                                >
                                                  {isFilled ? (
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                  ) : (
                                                    <Stamp className="h-2.5 w-2.5" />
                                                  )}
                                                </div>
                                              );
                                            },
                                          );
                                        })()}
                                        {stampInfo.currentStampCount > 0 && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {stampInfo.currentStampCount}/{stampInfo.stampTarget}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                                <ChevronRight
                                  className={cn(
                                    'w-5 h-5 transition-colors',
                                    isSelected ? 'text-primary' : 'text-gray-400',
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 max-w-2xl mx-auto">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                or browse by date
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Selected Freelancer Banner (if in freelancer-first flow) */}
            {selectedFreelancerData && flow !== 'initial' && (
              <div id="selected-freelancer-banner" className="max-w-2xl mx-auto">
                <div className="p-4 bg-gradient-to-r from-primary/5 to-mint/5 dark:from-primary/10 dark:to-mint/10 border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-300 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <ProfileAvatarImage
                          src={selectedFreelancerData.profilePicture || undefined}
                          alt={selectedFreelancerData.name || 'Freelancer'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-mint/20 text-primary font-bold">
                          {selectedFreelancerData.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-charcoal dark:text-white">
                            {selectedFreelancerData.name}
                          </p>
                          <VerificationBadge
                            status={selectedFreelancerData.verificationStatus || 'unverified'}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedFreelancerData.jobTitle?.name || 'Freelancer'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProfile(selectedFreelancerData)}
                        className="text-primary hover:text-primary/80"
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Section */}
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] h-[calc(100vh-180px)] min-h-[900px] md:min-h-[700px] lg:h-[calc(100vh-350px)] lg:min-h-[600px] lg:max-h-[800px]">
                    {/* Calendar */}
                    <div className="p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center min-h-[400px] md:min-h-0">
                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h2 className="font-poppins font-semibold text-lg text-charcoal dark:text-white">
                          Select a Date
                        </h2>
                      </div>
                      <div className="flex justify-center items-center flex-1 w-full py-4">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate || undefined}
                          onSelect={(date) => date && handleDateSelect(date)}
                          disabled={(date) => date < today}
                          className="rounded-lg scale-100 md:scale-110"
                        />
                      </div>
                    </div>

                    {/* Right Panel - Dynamic Content */}
                    <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col overflow-hidden min-h-[400px] md:min-h-0">
                      {/* Initial State */}
                      {flow === 'initial' && !selectedDate && (
                        <div className="flex-1 flex items-center justify-center text-center">
                          <div>
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Search for a freelancer or select a date
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              to see available appointments
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Freelancer Selected - Show their calendar */}
                      {flow === 'therapist-selected' && !selectedDate && (
                        <div className="flex-1 flex items-center justify-center text-center">
                          <div>
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Now select a date
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              to see {selectedFreelancerData?.name}&apos;s available times
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Date Selected - Show freelancers available */}
                      {flow === 'date-selected' && selectedDate && (
                        <div className="flex-1 overflow-y-auto">
                          <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="font-poppins font-semibold text-lg text-charcoal dark:text-white">
                              Available on {format(selectedDate, 'MMMM d')}
                            </h2>
                          </div>

                          {isLoadingFreelancersByDate ? (
                            <div className="space-y-4">
                              <div className="space-y-4 md:space-y-3">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="w-full p-5 md:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[100px] md:min-h-[90px]"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                                      <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Skeleton className="h-5 w-32" />
                                          <Skeleton className="h-4 w-4 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-24" />
                                        <div className="flex items-center gap-3">
                                          <Skeleton className="h-4 w-20" />
                                          <Skeleton className="h-4 w-16" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading available freelancers...
                              </p>
                            </div>
                          ) : freelancersWithSlots.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500 dark:text-gray-400">
                                No freelancers available on this date
                              </p>
                              <Button
                                variant="link"
                                onClick={() => setSelectedDate(null)}
                                className="mt-2 text-primary"
                              >
                                Choose another date
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4 md:space-y-3">
                              {freelancersWithSlots.map((freelancer) => {
                                const expert = mapOneFreelancerToExpert(freelancer);
                                const { stampInfo } = expert;
                                return (
                                  <button
                                    key={freelancer.id}
                                    onClick={() => handleTherapistSelect(expert)}
                                    className="w-full p-5 md:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group min-h-[100px] md:min-h-[90px]"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-primary/20">
                                        <ProfileAvatarImage
                                          src={freelancer.profilePicture || undefined}
                                          alt={freelancer.name || 'Freelancer'}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-mint/20 text-primary font-semibold">
                                          {freelancer.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-charcoal dark:text-white truncate">
                                            {freelancer.name}
                                          </span>
                                          <VerificationBadge
                                            status={freelancer.verificationStatus || 'unverified'}
                                            size="sm"
                                          />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                          {expert.jobTitle?.name || 'Freelancer'}
                                        </p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <RatingDisplay
                                            rating={expert.rating ?? expert.cardInfo?.averageRating}
                                            reviewCount={
                                              expert.cardInfo?.totalRatings ?? expert.reviews ?? 0
                                            }
                                            size="sm"
                                            showCount={true}
                                          />
                                          {stampInfo && (
                                            <div className="flex items-center gap-1.5">
                                              {(() => {
                                                const target = stampInfo.stampTarget ?? 5;
                                                const currentCount = Number(
                                                  stampInfo.currentStampCount ?? 0,
                                                );
                                                const maxCount = Math.min(currentCount, target);
                                                return Array.from(
                                                  { length: Math.min(target, 5) },
                                                  (_, index) => {
                                                    const isFilled = index < maxCount;
                                                    return (
                                                      <div
                                                        key={index}
                                                        className={cn(
                                                          'flex items-center justify-center w-4 h-4 rounded-full border',
                                                          isFilled
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600',
                                                        )}
                                                      >
                                                        {isFilled ? (
                                                          <CheckCircle2 className="h-2.5 w-2.5" />
                                                        ) : (
                                                          <Stamp className="h-2.5 w-2.5" />
                                                        )}
                                                      </div>
                                                    );
                                                  },
                                                );
                                              })()}
                                              {stampInfo.currentStampCount > 0 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {stampInfo.currentStampCount}/
                                                  {stampInfo.stampTarget}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          <Badge
                                            variant="secondary"
                                            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          >
                                            {(freelancer as any).slotCount} slots
                                          </Badge>
                                        </div>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Booking Flow */}
                      {flow === 'booking' && selectedDate && selectedFreelancerData && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="flex-1 overflow-y-auto">
                            {/* Time Selection */}
                            {bookingStep === 'time' && (
                              <div className="h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                  <Clock className="w-5 h-5 text-primary" />
                                  <h3 className="font-semibold text-charcoal dark:text-white">
                                    Select Time
                                  </h3>
                                </div>
                                {isLoadingFreelancerSlots ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3 md:gap-2">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <Skeleton
                                          key={i}
                                          className="h-12 md:h-10 rounded-lg min-h-[44px] md:min-h-0"
                                        />
                                      ))}
                                    </div>
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                      Loading available times...
                                    </p>
                                  </div>
                                ) : availableSlots.length === 0 ? (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No available slots
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-3 gap-3 md:gap-2 flex-1">
                                    {availableSlots.map((slot) => {
                                      const slotTime = parseISO(slot.startTime);
                                      const isSelected = selectedSlot === slot.id;
                                      return (
                                        <button
                                          key={slot.id}
                                          onClick={() => {
                                            setSelectedSlot(slot.id);
                                            setSelectedService('');
                                            setLocationType(null);
                                            setBookingStep('service');
                                          }}
                                          className={cn(
                                            'py-3 md:py-2 px-3 rounded-lg text-sm md:text-sm font-medium transition-all duration-200 min-h-[44px] md:min-h-0',
                                            isSelected
                                              ? 'bg-primary text-white shadow-md'
                                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-charcoal dark:text-white',
                                          )}
                                        >
                                          {format(slotTime, 'h:mm a')}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Service Selection */}
                            {bookingStep === 'service' &&
                              selectedSlot &&
                              availableServices.length > 0 && (
                                <div className="animate-in slide-in-from-right-2 duration-300">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-charcoal dark:text-white">
                                      Select Service
                                    </h3>
                                  </div>
                                  <RadioGroup
                                    value={selectedService}
                                    onValueChange={(value) => {
                                      setSelectedService(value);
                                      setLocationType(null);
                                    }}
                                    className="space-y-2"
                                  >
                                    {availableServices.map((service) => (
                                      <div
                                        key={service.id}
                                        className={cn(
                                          'flex items-center gap-3 p-4 md:p-3 rounded-lg border cursor-pointer transition-all duration-200 min-h-[56px] md:min-h-0',
                                          selectedService === service.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800',
                                        )}
                                        onClick={() => {
                                          setSelectedService(service.id);
                                          setLocationType(null);
                                        }}
                                      >
                                        <RadioGroupItem value={service.id} id={service.id} />
                                        <Label
                                          htmlFor={service.id}
                                          className="flex-1 cursor-pointer"
                                        >
                                          <span className="font-medium text-charcoal dark:text-white">
                                            {service.name}
                                          </span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                              )}

                            {/* Location Selection */}
                            {bookingStep === 'location' &&
                              selectedService &&
                              availableLocationTypes.length > 0 && (
                                <div className="animate-in slide-in-from-right-2 duration-300">
                                  <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-charcoal dark:text-white">
                                      Select Location
                                    </h3>
                                  </div>
                                  <RadioGroup
                                    value={locationType || undefined}
                                    onValueChange={(value) =>
                                      setLocationType(value as LocationType)
                                    }
                                    className="space-y-2"
                                  >
                                    {availableLocationTypes.includes(LocationType.HOME) && (
                                      <div
                                        className={cn(
                                          'flex items-center gap-3 p-4 md:p-3 rounded-lg border cursor-pointer transition-all duration-200 min-h-[56px] md:min-h-0',
                                          locationType === LocationType.HOME
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800',
                                        )}
                                        onClick={() => setLocationType(LocationType.HOME)}
                                      >
                                        <RadioGroupItem value={LocationType.HOME} id="home" />
                                        <Home className="w-5 h-5 text-gray-500" />
                                        <Label htmlFor="home" className="flex-1 cursor-pointer">
                                          <span className="font-medium text-charcoal dark:text-white">
                                            At Home
                                          </span>
                                        </Label>
                                      </div>
                                    )}
                                    {availableLocationTypes.includes(LocationType.CLINIC) && (
                                      <div
                                        className={cn(
                                          'flex items-center gap-3 p-4 md:p-3 rounded-lg border cursor-pointer transition-all duration-200 min-h-[56px] md:min-h-0',
                                          locationType === LocationType.CLINIC
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800',
                                        )}
                                        onClick={() => setLocationType(LocationType.CLINIC)}
                                      >
                                        <RadioGroupItem value={LocationType.CLINIC} id="clinic" />
                                        <Building2 className="w-5 h-5 text-gray-500" />
                                        <Label htmlFor="clinic" className="flex-1 cursor-pointer">
                                          <span className="font-medium text-charcoal dark:text-white">
                                            At Clinic
                                          </span>
                                        </Label>
                                      </div>
                                    )}
                                  </RadioGroup>

                                  {/* Address input for home visits */}
                                  {locationType === LocationType.HOME && (
                                    <div className="mt-3 animate-in slide-in-from-top-2 duration-200 space-y-2">
                                      <Input
                                        placeholder="Enter your address"
                                        value={homeAddress}
                                        onChange={(e) => setHomeAddress(e.target.value)}
                                        className={cn(
                                          'bg-white dark:bg-gray-800',
                                          !homeAddress.trim() &&
                                            'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
                                        )}
                                      />
                                      {!homeAddress.trim() && (
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                          Please enter your address to continue
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Confirm Step */}
                            {bookingStep === 'confirm' && (
                              <div className="animate-in slide-in-from-right-2 duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                  <CheckCircle className="w-5 h-5 text-primary" />
                                  <h3 className="font-semibold text-charcoal dark:text-white">
                                    Review & Confirm
                                  </h3>
                                </div>
                                {canConfirmBooking ? (
                                  <>
                                    <div className="space-y-3 mb-4">
                                      {selectedFreelancerData && (
                                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Freelancer:
                                          </span>
                                          <span className="font-medium text-charcoal dark:text-white">
                                            {selectedFreelancerData.name}
                                          </span>
                                        </div>
                                      )}
                                      {selectedDate && selectedSlotData && (
                                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Date & Time:
                                          </span>
                                          <span className="font-medium text-charcoal dark:text-white">
                                            {format(
                                              parseISO(selectedSlotData.startTime),
                                              'MMM d, h:mm a',
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {selectedServiceData && (
                                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Service:
                                          </span>
                                          <span className="font-medium text-charcoal dark:text-white">
                                            {selectedServiceData.name}
                                          </span>
                                        </div>
                                      )}
                                      {locationType && (
                                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Location:
                                          </span>
                                          <span className="font-medium text-charcoal dark:text-white">
                                            {locationType === LocationType.HOME
                                              ? 'At Home'
                                              : 'At Clinic'}
                                          </span>
                                        </div>
                                      )}
                                      {locationType === LocationType.HOME && homeAddress && (
                                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Address:
                                          </span>
                                          <span className="font-medium text-charcoal dark:text-white text-right max-w-[60%]">
                                            {homeAddress}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between pt-4">
                                        <span className="text-lg font-semibold text-charcoal dark:text-white">
                                          Total:
                                        </span>
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
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
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
                          </div>

                          {/* Navigation Buttons */}
                          {bookingStep !== 'confirm' && (
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                variant="outline"
                                onClick={handlePreviousStep}
                                disabled={!canGoPrevious()}
                                className="flex items-center gap-2"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </Button>
                              {bookingStep === 'location' && canConfirmBooking ? (
                                <Button
                                  onClick={() => setBookingStep('confirm')}
                                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                                >
                                  Review & Confirm
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={handleNextStep}
                                  disabled={!canGoNext()}
                                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Address Dialog */}
        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Your Address</DialogTitle>
              <DialogDescription>
                Please provide your full address for the home visit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Street, City, Postal Code"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tempAddress.trim()) {
                    handleSaveAddress();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
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
              profilePicture: profileFreelancer.profilePicture,
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
                handleSelectFreelancer(profileFreelancer);
              },
              hasAvailableSlots: true,
              stampInfo: profileFreelancer.stampInfo || undefined,
              durationPricing: profileFreelancer.durationPricing,
              serviceCategoryPricing: profileFreelancer.serviceCategoryPricing,
            }}
          />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
