'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CalendarIcon, CheckCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import SocketDebugger from '@/components/debug/SocketDebugger';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useStampDetail } from '@/hooks/queries/useLoyalty';
import { useFreelancerPricing } from '@/hooks/queries/usePricing';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { useSocketSlots } from '@/hooks/useSocketSlots';
import { useBookingStore } from '@/stores/bookingStore';
import { getApiErrorMessage, type ServiceCategory } from '@/types/common';
import type { LocationType } from '@/types/pricing';
import type { Expert, Slot } from '@/types/types';

import { BookingSummarySidebar } from './BookingSummarySidebar';
import { ConfirmStep } from './steps/ConfirmStep';
import { DetailsStep } from './steps/DetailsStep';
import { ScheduleStep } from './steps/ScheduleStep';

// Form validation schemas
const serviceSchema = z.object({
  serviceCategoryIds: z.array(z.string()).optional(),
});

const detailsSchema = z.object({
  notes: z.string().optional(),
  clientAddress: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

interface ModernBookingFlowProps {
  rescheduleBookingId?: string | null;
  freelancerData?: Expert | null;
}

const ModernBookingFlow: React.FC<ModernBookingFlowProps> = ({ freelancerData }) => {
  const params = useParams();
  const router = useRouter();

  const freelancerId = Array.isArray(params?.['freelancerId'])
    ? params?.['freelancerId'][0]
    : params?.['freelancerId'];

  // Use React Query hooks
  const { data: slots = [] } = useAvailableSlots(freelancerId ?? null);
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const { data: stampDetail } = useStampDetail(selectedTherapistId);
  // Note: useFreelancerPricing fetches pricing for logged-in freelancer
  // In booking flow, we're booking with a different freelancer
  // For now, pricing will be optional and we'll use slot's basePrice as fallback
  // TODO: Add endpoint to fetch pricing for a specific freelancer if needed
  const { data: pricing } = useFreelancerPricing();

  // Location selection state
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType | null>(null);

  // Use WebSocket hook for real-time slot updates
  const { reserveSlot, releaseSlot, isSlotReserved } = useSocketSlots(freelancerId);

  // Use booking store for state management
  const {
    currentStep,
    selectedDate,
    selectedTime,
    datePage,
    freelancerServices,
    setSelectedDate,
    setSelectedTime,
    setDatePage,
    setAvailableServices,
    setFreelancerServices,
    nextStep: storeNextStep,
    prevStep: storePrevStep,
  } = useBookingStore();

  const [loadingMoreSlots] = useState(false);

  // Form states
  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { serviceCategoryIds: [] },
  });

  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
  });

  // Extract service categories from slots when they're loaded
  useEffect(() => {
    if (slots && slots.length > 0) {
      // Collect all unique service categories from all slots
      const allCategories = new Map<string, ServiceCategory>();
      slots.forEach((slot) => {
        if (slot.availableServiceCategories && Array.isArray(slot.availableServiceCategories)) {
          slot.availableServiceCategories.forEach((category) => {
            if (!allCategories.has(category.id)) {
              allCategories.set(category.id, category);
            }
          });
        }
      });
      setFreelancerServices(Array.from(allCategories.values()));
    }
  }, [slots, setFreelancerServices]);

  // Get slot details from already-fetched slots when a slot is selected
  const fetchSlotDetails = useCallback(
    (slotId: string) => {
      // Find the slot in the already-fetched slots
      const slot = slots?.find((s) => s.id === slotId);
      if (slot) {
        // Use service categories from the slot
        if (slot.availableServiceCategories && slot.availableServiceCategories.length > 0) {
          setAvailableServices(slot.availableServiceCategories);
        } else if (slot.availableServices && slot.availableServices.length > 0) {
          // Fallback to legacy availableServices
          setAvailableServices(slot.availableServices);
        } else {
          // Slot has no services - set to empty array
          setAvailableServices([]);
        }
      } else {
        // If slot not found, set to empty array
        setAvailableServices([]);
      }
    },
    [slots, setAvailableServices],
  );

  // Update available services when slot is selected
  useEffect(() => {
    if (selectedTime) {
      fetchSlotDetails(selectedTime);
    } else {
      // Reset service selection when no slot is selected
      setAvailableServices([]);
      serviceForm.setValue('serviceCategoryIds', []);
      setSelectedLocationType(null);
    }
  }, [selectedTime, fetchSlotDetails, serviceForm, setAvailableServices]);

  // Calculate available location types based on selected service categories
  const availableLocationTypes = useMemo(() => {
    const selectedCategoryIds = serviceForm.watch('serviceCategoryIds') || [];
    const selectedSlot = slots.find((s) => s.id === selectedTime);

    if (selectedCategoryIds.length === 0) {
      // No categories selected - use slot's locationType or default to CLINIC
      if (selectedSlot?.locationType) {
        return [selectedSlot.locationType as LocationType];
      }
      return ['CLINIC' as LocationType];
    }

    // If pricing is not available, use slot's locationType or default to CLINIC
    if (!pricing?.servicePricing) {
      if (selectedSlot?.locationType) {
        return [selectedSlot.locationType as LocationType];
      }
      return ['CLINIC' as LocationType];
    }

    // Find common location types across all selected categories
    const locationSets = selectedCategoryIds.map((categoryId) => {
      const servicePricing = pricing.servicePricing.find((sp) => sp.serviceId === categoryId);
      if (!servicePricing) return new Set<LocationType>();

      // Use new location-based structure if available
      if (servicePricing.locations && servicePricing.locations.length > 0) {
        return new Set(servicePricing.locations.map((loc) => loc.locationType));
      }

      // Fallback: if legacy price exists, assume CLINIC is available
      if (servicePricing.price > 0) {
        return new Set<LocationType>(['CLINIC']);
      }

      return new Set<LocationType>();
    });

    // Find intersection of all location sets
    if (locationSets.length === 0) {
      // If no locations found, fall back to slot's locationType
      if (selectedSlot?.locationType) {
        return [selectedSlot.locationType as LocationType];
      }
      return ['CLINIC' as LocationType];
    }

    const commonLocations = locationSets.reduce((intersection, locationSet) => {
      if (intersection.size === 0) return locationSet;
      return new Set(Array.from(intersection).filter((loc) => locationSet.has(loc)));
    });

    const result = Array.from(commonLocations);
    // If no common locations, fall back to slot's locationType or CLINIC
    if (result.length === 0) {
      if (selectedSlot?.locationType) {
        return [selectedSlot.locationType as LocationType];
      }
      return ['CLINIC' as LocationType];
    }

    return result;
  }, [serviceForm.watch('serviceCategoryIds'), pricing, selectedTime, slots]);

  // Auto-select location when available options change
  useEffect(() => {
    if (availableLocationTypes.length === 0) {
      setSelectedLocationType(null);
      return;
    }

    if (availableLocationTypes.length === 1) {
      // Auto-select single available location
      setSelectedLocationType(availableLocationTypes[0] ?? null);
    } else if (availableLocationTypes.length > 1) {
      // Multiple options - default to CLINIC if available, otherwise first option
      if (availableLocationTypes.includes('CLINIC')) {
        setSelectedLocationType('CLINIC');
      } else {
        setSelectedLocationType(availableLocationTypes[0] ?? null);
      }
    }
  }, [availableLocationTypes]);

  // Load more slots when needed - React Query handles pagination automatically
  const loadMoreSlots = async () => {
    // React Query handles pagination automatically
    // This can be implemented with infinite queries if needed
    setDatePage(datePage + 1);
  };

  // Track if component is mounted to prevent cleanup during re-renders
  const isMountedRef = useRef(true);
  const selectedTimeRef = useRef(selectedTime);

  // Handle slot selection with reservation
  const handleSlotSelection = (slotId: string) => {
    // Release previously selected slot if any (and it's different)
    if (selectedTime && selectedTime !== slotId) {
      // Add a small delay to ensure previous reservation is processed
      setTimeout(() => {
        if (isMountedRef.current) {
          releaseSlot(selectedTime);
        }
      }, 100);
    }

    // Reserve the new slot
    if (slotId !== selectedTime) {
      reserveSlot(slotId, 300000); // 5 minutes reservation
      toast.info('Slot reserved for 5 minutes. Complete your booking to confirm.');
    }

    setSelectedTime(slotId);
  };

  // Cleanup reservations on unmount - use useCallback to prevent infinite loops

  useEffect(() => {
    selectedTimeRef.current = selectedTime;
  }, [selectedTime]);

  // Cleanup reservations only on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Only cleanup if component is actually unmounting
      if (selectedTimeRef.current) {
        releaseSlot(selectedTimeRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  // Extract freelancer info from props or API data
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;

  // Calculate slot statistics from fetched slots
  const slotStats = useMemo(() => {
    if (!slots || slots.length === 0) {
      return {
        availableSlots: 0,
        totalSlots: 0,
        nextAvailableSlot: null,
      };
    }

    const availableSlots = slots.filter(
      (slot) => slot.status === 'AVAILABLE' && new Date(slot.startTime) > new Date(),
    );
    const nextAvailable =
      availableSlots.length > 0
        ? availableSlots.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          )[0]
        : null;

    return {
      availableSlots: availableSlots.length,
      totalSlots: slots.length,
      nextAvailableSlot: nextAvailable,
    };
  }, [slots]);

  const therapist = useMemo(() => {
    // Use freelancerData prop if available (from route params)
    if (freelancerData) {
      return {
        id: freelancerData.id,
        name: freelancerData.name,
        specialty: freelancerData.specialty ?? 'Freelancer',
        rating: freelancerData.rating ?? 0,
        reviews: freelancerData.reviews ?? 0,
        avatar: freelancerData.profilePicture ?? undefined,
        location: freelancerData.location ?? 'Online',
        services:
          freelancerServices.length > 0 ? freelancerServices : (freelancerData.services ?? []),
        sessionTypes: freelancerData.sessionTypes ?? [],
        pricing: freelancerData.pricing,
        description: freelancerData.description ?? '',
        availableSlots: slotStats.availableSlots,
        totalSlots: slotStats.totalSlots,
        nextAvailableSlot: slotStats.nextAvailableSlot,
        cardInfo: freelancerData.cardInfo,
        isFavorite: freelancerData.isFavorite,
      };
    }

    // Fallback to slot data if no freelancerData prop
    if (!firstSlot) return null;

    return {
      id: firstSlot.freelancerId,
      name: firstSlot.freelancerName ?? 'Freelancer',
      specialty: 'Freelancer', // Fallback
      rating: firstSlot.averageRating ?? 0,
      reviews: firstSlot.numberOfRatings ?? 0,
      avatar: firstSlot.profilePicture,
      experience: undefined,
      location: firstSlot.location?.name,
      services: freelancerServices.length > 0 ? freelancerServices : [],
      sessionTypes: [],
      pricing: undefined,
      description: undefined,
      availableSlots: slotStats.availableSlots,
      totalSlots: slotStats.totalSlots,
      nextAvailableSlot: slotStats.nextAvailableSlot,
      cardInfo: undefined,
      isFavorite: false,
    };
  }, [freelancerData, firstSlot, freelancerServices, slotStats]);

  // Update selected therapist ID when therapist changes
  useEffect(() => {
    if (therapist?.id && selectedTherapistId !== therapist.id) {
      setSelectedTherapistId(therapist.id);
    }
  }, [therapist?.id, selectedTherapistId]);

  // Helper function to format date safely without timezone issues
  const formatDateForAPI = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  };

  // Group slots by date - show all slots with different visual indicators
  const slotsByDate: Record<string, Slot[]> = {};
  slots?.forEach((slot) => {
    // Show all slots (available, reserved, booked) with different visual indicators
    const date = formatDateForAPI(new Date(slot.startTime));
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });

  const availableDates = Object.keys(slotsByDate).sort();
  const datesPerPage = 6;
  const totalDatePages = Math.ceil(availableDates.length / datesPerPage);
  const currentDatePage = Math.min(datePage, totalDatePages - 1);
  const displayedDates = availableDates.slice(
    currentDatePage * datesPerPage,
    (currentDatePage + 1) * datesPerPage,
  );

  const steps = [
    {
      id: 1,
      title: 'Select Date & Time',
      icon: CalendarIcon,
      description: 'Choose your appointment',
    },
    { id: 2, title: 'Confirm', icon: CheckCircle, description: 'Review & book' },
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && selectedTime;
      case 2:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        if (selectedDate && selectedTime) {
          isValid = true;
        } else {
          toast.error('Please select both a date and time');
          return;
        }
        break;
      case 2:
        isValid = true;
        break;
      default:
        return;
    }

    if (isValid && currentStep < steps.length) {
      storeNextStep();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      storePrevStep();
    }
  };

  const handleCompleteBooking = async () => {
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    const serviceData = serviceForm.getValues();
    const detailsData = detailsForm.getValues();

    // Validate location selection
    const selectedCategoryIds = serviceData.serviceCategoryIds ?? [];
    if (selectedCategoryIds.length > 0 && availableLocationTypes.length === 0) {
      toast.error(
        'Selected service categories have no common location type. Please select different categories.',
      );
      return;
    }

    if (selectedCategoryIds.length > 0 && !selectedLocationType) {
      toast.error('Please select a location type');
      return;
    }

    const bookingData = {
      slotId: selectedTime,
      serviceCategoryIds: selectedCategoryIds,
      locationType: selectedLocationType || undefined,
      notes: detailsData.notes ?? '',
      clientAddress: detailsData.clientAddress ?? '',
    };

    createBooking(bookingData, {
      onSuccess: (response) => {
        // Get the message from the response if available
        const responseMessage = (response as { message?: string })?.message;
        toast.success(responseMessage, {
          autoClose: 5000, // Show for 5 seconds to read the stamp message
        });
        router.push('/dashboard/my-bookings');
      },
      onError: (err: unknown) => {
        const errorMessage = getApiErrorMessage(err);
        // Handle 403 errors for expired trial freelancers
        if (
          (err as { status?: number; statusCode?: number; response?: { status?: number } })
            ?.status === 403 ||
          (err as { status?: number; statusCode?: number; response?: { status?: number } })
            ?.statusCode === 403 ||
          (err as { status?: number; statusCode?: number; response?: { status?: number } })
            ?.response?.status === 403
        ) {
          const finalMessage =
            errorMessage ||
            "This freelancer's trial has expired. They cannot accept new bookings. Please subscribe to continue.";
          toast.error(finalMessage, {
            autoClose: 7000, // Show longer for important messages
          });
        } else {
          toast.error(errorMessage || 'Failed to book appointment');
        }
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScheduleStep
            therapistName={therapist?.name}
            slotsByDate={slotsByDate}
            totalDatePages={totalDatePages}
            displayedDates={displayedDates}
            availableDates={availableDates}
            loadingMoreSlots={loadingMoreSlots}
            isSlotReserved={isSlotReserved}
            onDateSelect={setSelectedDate}
            onTimeSelect={handleSlotSelection}
            onDatePageChange={setDatePage}
            onLoadMore={loadMoreSlots}
            formatDateForAPI={formatDateForAPI}
          />
        );

      case 2:
        return (
          <DetailsStep
            therapistName={therapist?.name}
            slotsByDate={slotsByDate}
            serviceForm={serviceForm}
            detailsForm={detailsForm}
            availableLocationTypes={availableLocationTypes}
            selectedLocationType={selectedLocationType}
            onLocationTypeChange={setSelectedLocationType}
          />
        );

      case 3:
        return (
          <ConfirmStep
            therapist={therapist}
            slotsByDate={slotsByDate}
            serviceForm={serviceForm}
            detailsForm={detailsForm}
            stampDetail={stampDetail}
          />
        );

      default:
        return null;
    }
  };

  if (!therapist) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with Progress */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {/* Improved Progress Indicator */}
            <div className="flex-1 flex items-center gap-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        currentStep >= step.id
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                    </div>
                    <div className="hidden sm:block">
                      <div
                        className={`text-sm font-medium ${
                          currentStep >= step.id
                            ? 'text-charcoal dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        currentStep > step.id ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Main Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {renderStepContent()}

            {/* Continue Button - Moved to bottom of content */}
            {currentStep < steps.length && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-8 py-2.5 text-base font-semibold"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>

          {/* Booking Summary - Moved to bottom */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <BookingSummarySidebar
              currentStep={currentStep}
              totalSteps={steps.length}
              therapist={therapist}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slotsByDate={slotsByDate}
              serviceForm={serviceForm}
              stampDetail={stampDetail}
              isCreatingBooking={isCreatingBooking}
              onCompleteBooking={handleCompleteBooking}
              pricing={pricing}
              selectedLocationType={selectedLocationType}
            />
          </div>
        </div>
      </div>

      {/* Debug Info - Hidden by default */}
      {process.env.NODE_ENV === 'development' && (
        <details className="max-w-7xl mx-auto px-4 pb-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs space-y-2">
            <div className="grid grid-cols-4 gap-4">
              <div>Socket: {'N/A' /* isConnected missing */}</div>
              <div>Reserved: {'N/A' /* reservedSlots missing */}</div>
              <div>Slots: {slots?.length || 0}</div>
              <div>Selected: {selectedTime ? 'Yes' : 'No'}</div>
            </div>
            <SocketDebugger />
          </div>
        </details>
      )}
    </div>
  );
};

export default ModernBookingFlow;
