'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Star,
  Video,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { z } from 'zod';

import SocketDebugger from '@/components/debug/SocketDebugger';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useSocketSlots } from '@/hooks/useSocketSlots';
import { rescheduleBooking } from '@/redux/api/exploreApi';
import { getStampDetail } from '@/redux/api/loyaltyApi';
import { fetchUserBookings } from '@/redux/slices/bookingSlice';
import { fetchExplorePatientBookings } from '@/redux/slices/exploreSlice';
import { bookAppointment, fetchFreelancerSlots } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { StampDiscountBadge } from './StampDiscountBadge';

// Form validation schemas
const serviceSchema = z.object({
  serviceCategoryIds: z.array(z.string()).optional(),
  // sessionDuration: z.enum(['30', '45', '60', '90']),
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

const ModernBookingFlow: React.FC<ModernBookingFlowProps> = ({
  rescheduleBookingId,
  freelancerData,
}) => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const freelancerId = Array.isArray(params?.freelancerId)
    ? params?.freelancerId[0]
    : params?.freelancerId;
  const {
    slots,
    loading: slotsLoading,
    initialLoading: slotsInitialLoading,
  } = useSelector((state: RootState) => state.overview);
  const { stampDetail, isLoadingDetail, selectedTherapistId } = useSelector(
    (state: RootState) => state.stamps,
  );

  // Use WebSocket hook for real-time slot updates
  const { isConnected, reservedSlots, reserveSlot, releaseSlot, isSlotReserved } =
    useSocketSlots(freelancerId);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [datePage, setDatePage] = useState(0);
  const [loadingMoreSlots, setLoadingMoreSlots] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [freelancerServices, setFreelancerServices] = useState<any[]>([]);

  // Form states
  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { serviceCategoryIds: [] },
  });

  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
  });

  useEffect(() => {
    if (freelancerId) {
      dispatch(
        fetchFreelancerSlots({
          page: 1,
          limit: 100, // Increased limit to get more slots
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: freelancerId,
        }) as any,
      );
    }
  }, [dispatch, freelancerId]);

  // Extract service categories from slots when they're loaded
  useEffect(() => {
    if (slots && slots.length > 0) {
      // Collect all unique service categories from all slots
      const allCategories = new Map<string, any>();
      slots.forEach((slot: any) => {
        if (slot.availableServiceCategories && Array.isArray(slot.availableServiceCategories)) {
          slot.availableServiceCategories.forEach((category: any) => {
            if (!allCategories.has(category.id)) {
              allCategories.set(category.id, category);
            }
          });
        }
      });
      setFreelancerServices(Array.from(allCategories.values()));
    }
  }, [slots]);

  // Get slot details from already-fetched slots when a slot is selected
  const fetchSlotDetails = useCallback(
    (slotId: string) => {
      // Find the slot in the already-fetched slots
      const slot = slots?.find((s: any) => s.id === slotId);
      if (slot) {
        // Use service categories from the slot
        if (slot.availableServiceCategories && slot.availableServiceCategories.length > 0) {
          setAvailableServices(slot.availableServiceCategories);
        } else if (slot.availableServices && slot.availableServices.length > 0) {
          // Fallback to legacy availableServices
          setAvailableServices(slot.availableServices);
        } else {
          // Fallback to all freelancer service categories
          setAvailableServices(freelancerServices);
        }
      } else {
        // If slot not found, use all freelancer service categories
        setAvailableServices(freelancerServices);
      }
    },
    [slots, freelancerServices],
  );

  // Update available services when slot is selected
  useEffect(() => {
    if (selectedTime) {
      fetchSlotDetails(selectedTime);
    } else {
      // Reset service selection when no slot is selected
      setAvailableServices([]);
      serviceForm.setValue('serviceCategoryIds', []);
    }
  }, [selectedTime, fetchSlotDetails, serviceForm]);

  // Load more slots when needed - with WebSocket connection check
  const loadMoreSlots = async () => {
    if (!freelancerId || loadingMoreSlots) return;

    // Check WebSocket connection before loading
    if (!isConnected) {
      toast.warning('Connection issue detected. Loading dates via standard method...', {
        autoClose: 3000,
      });
    }

    setLoadingMoreSlots(true);
    try {
      await dispatch(
        fetchFreelancerSlots({
          page: datePage + 2,
          limit: 100,
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: freelancerId,
        }) as any,
      );
      setDatePage(datePage + 1);
    } catch (error: any) {
      console.error('Failed to load more slots:', error);
      toast.error('Failed to load more dates. Please try again.', {
        autoClose: 3000,
      });
    } finally {
      setLoadingMoreSlots(false);
    }
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

  // Handle reservation failures - clear selection if the failed slot is currently selected
  useEffect(() => {
    const handleReservationFailed = (event: CustomEvent) => {
      const errorDetail = event.detail;
      // Clear the selection if reservation failed for the currently selected slot
      if (errorDetail?.slotId === selectedTime) {
        setSelectedTime('');
      }
    };

    window.addEventListener('slot-reservation-failed', handleReservationFailed as EventListener);
    return () => {
      window.removeEventListener(
        'slot-reservation-failed',
        handleReservationFailed as EventListener,
      );
    };
  }, [selectedTime]);

  // Update ref when selectedTime changes
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
      (slot: any) => slot.status === 'AVAILABLE' && new Date(slot.startTime) > new Date(),
    );
    const nextAvailable =
      availableSlots.length > 0
        ? availableSlots.sort(
            (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
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
        specialty: freelancerData.specialty || 'Therapist',
        rating: freelancerData.rating || 0,
        reviews: freelancerData.reviews || 0,
        avatar: freelancerData.profilePicture,
        location: freelancerData.location || 'Online',
        services:
          freelancerServices.length > 0 ? freelancerServices : freelancerData.services || [],
        sessionTypes: freelancerData.sessionTypes || [],
        pricing: freelancerData.pricing,
        description: freelancerData.description || '',
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
      name: firstSlot.freelancerName || firstSlot.freelancer?.name,
      specialty: firstSlot.freelancer?.mainService || 'Therapist', // Fallback
      rating: firstSlot.averageRating || firstSlot.freelancer?.averageRating || 0,
      reviews: firstSlot.numberOfRatings || firstSlot.freelancer?.cardInfo?.totalRatings || 0,
      avatar: firstSlot.profilePicture || firstSlot.freelancer?.profilePicture,
      experience: firstSlot.freelancer?.yearsOfExperience
        ? `${firstSlot.freelancer.yearsOfExperience}+ years`
        : firstSlot.freelancer?.createdAt
          ? `${Math.floor((new Date().getTime() - new Date(firstSlot.freelancer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))}+ years`
          : undefined,
      location: firstSlot.location?.name || firstSlot.freelancer?.locations?.[0]?.name,
      services:
        freelancerServices.length > 0 ? freelancerServices : firstSlot.freelancer?.services || [],
      sessionTypes: firstSlot.freelancer?.sessionTypes || [],
      pricing: firstSlot.freelancer?.pricing,
      description: firstSlot.freelancer?.description,
      availableSlots: slotStats.availableSlots,
      totalSlots: slotStats.totalSlots,
      nextAvailableSlot: slotStats.nextAvailableSlot,
      cardInfo: firstSlot.freelancer?.cardInfo,
      isFavorite: firstSlot.freelancer?.isFavorite,
    };
  }, [freelancerData, firstSlot, freelancerServices, slotStats]);

  // Fetch stamp detail when therapist is available
  useEffect(() => {
    // Only fetch if:
    // 1. therapist ID is available
    // 2. Not currently loading
    // 3. Don't have detail for this therapist already loaded
    if (
      therapist?.id &&
      !isLoadingDetail &&
      (!stampDetail ||
        stampDetail.therapist.id !== therapist.id ||
        selectedTherapistId !== therapist.id)
    ) {
      dispatch(getStampDetail(therapist.id) as any);
    }
  }, [dispatch, therapist?.id, isLoadingDetail, stampDetail?.therapist.id, selectedTherapistId]);

  // Helper function to format date safely without timezone issues
  const formatDateForAPI = useCallback((date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }, []);

  // Group slots by date - filter out past dates
  const slotsByDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateForAPI(today);

    const grouped: { [date: string]: any[] } = {};
    slots?.forEach((slot: any) => {
      const slotDate = new Date(slot.startTime);
      const date = formatDateForAPI(slotDate);
      // Only include future dates (today and later)
      if (date >= todayStr) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(slot);
      }
    });
    return grouped;
  }, [slots]);

  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate).sort();
  }, [slotsByDate]);

  // Convert available dates to Date objects for calendar
  const availableDatesAsDates = useMemo(() => {
    return availableDates.map((dateStr) => new Date(dateStr + 'T00:00:00'));
  }, [availableDates]);

  // Get selected date as Date object for calendar
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    return new Date(selectedDate + 'T00:00:00');
  }, [selectedDate]);

  // Get slot counts per date for calendar indicators
  const dateSlotCounts = useMemo(() => {
    const counts: { [date: string]: number } = {};
    availableDates.forEach((date) => {
      counts[date] = slotsByDate[date]?.length || 0;
    });
    return counts;
  }, [availableDates, slotsByDate]);

  // Handle calendar date selection
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = formatDateForAPI(date);
      if (availableDates.includes(dateStr)) {
        setSelectedDate(dateStr);
        setSelectedTime(''); // Reset time when date changes
      }
    }
  };

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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteBooking = async () => {
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      const serviceData = serviceForm.getValues();
      const detailsData = detailsForm.getValues();

      const bookingData = {
        slotId: selectedTime,
        serviceCategoryIds: serviceData.serviceCategoryIds || [],
        notes: detailsData.notes || '',
        clientAddress: detailsData.clientAddress || '',
      };

      if (rescheduleBookingId) {
        await rescheduleBooking(rescheduleBookingId, selectedTime);
        toast.success('Appointment rescheduled successfully!');
      } else {
        // Use Redux action instead of direct fetch
        const result = await dispatch(bookAppointment(bookingData) as any);

        if (bookAppointment.fulfilled.match(result)) {
          // Get the message from the response if available
          const responseMessage = result.payload?.message || 'Appointment booked successfully!';
          toast.success(responseMessage, {
            autoClose: 5000, // Show for 5 seconds to read the stamp message
          });

          // Refresh bookings in both slices before navigating
          await Promise.all([
            dispatch(
              fetchUserBookings({
                page: 1,
                limit: 1000,
                sortBy: 'slot.startTime',
                sortOrder: 'asc',
                silent: false, // Force refresh
              }) as any,
            ),
            dispatch(fetchExplorePatientBookings({ silent: false }) as any),
          ]);

          router.push('/dashboard/my-bookings?fromBooking=true');
        } else {
          // Handle error payload (could be string or object with status)
          const errorPayload = result.payload;
          const errorMessage =
            typeof errorPayload === 'string'
              ? errorPayload
              : errorPayload?.message || 'Failed to book appointment';
          const errorStatus = typeof errorPayload === 'object' ? errorPayload?.status : null;
          throw { message: errorMessage, status: errorStatus, statusCode: errorStatus };
        }
      }
    } catch (err: any) {
      // Handle 403 errors for expired trial freelancers
      if (err?.status === 403 || err?.statusCode === 403) {
        const errorMessage =
          err?.message ||
          err?.data?.message ||
          "This freelancer's trial has expired. They cannot accept new bookings. Please subscribe to continue.";
        toast.error(errorMessage, {
          autoClose: 7000, // Show longer for important messages
        });
        // Optionally redirect or refresh the page to update freelancer list
        // router.refresh();
      } else {
        toast.error(err?.message || 'Failed to book appointment');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-poppins font-bold text-charcoal">
                Select a date & time
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
                Choose when you&apos;d like to meet
              </p>
            </div>

            {/* Loading State for Initial Load */}
            {slotsInitialLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading available dates...
                </p>
              </div>
            )}

            {/* WebSocket Connection Status - Only show if disconnected after initial load */}
            {!slotsInitialLoading && !isConnected && availableDates.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Real-time updates unavailable. Slots are still available for booking.
                </p>
              </div>
            )}

            {/* Date Selection - Full Calendar View */}
            {!slotsInitialLoading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-poppins font-semibold text-charcoal">
                    Select Date
                  </h3>
                  {availableDates.length === 0 && !slotsLoading && (
                    <p className="text-sm text-gray-500">No available dates</p>
                  )}
                </div>

                {/* Full Calendar Component */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleCalendarDateSelect}
                    disabled={(date) => {
                      const dateStr = formatDateForAPI(date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const todayStr = formatDateForAPI(today);
                      // Disable past dates and dates without slots
                      return date < today || !availableDates.includes(dateStr);
                    }}
                    modifiers={{
                      available: availableDatesAsDates,
                    }}
                    modifiersClassNames={{
                      available: 'relative',
                    }}
                    className="rounded-lg border p-4 bg-white dark:bg-gray-800"
                    classNames={{
                      day: 'relative',
                      day_selected: 'bg-primary text-white hover:bg-primary hover:text-white',
                      day_disabled: 'opacity-30 cursor-not-allowed',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Time Selection - Clean Grid */}
            {selectedDate && (
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-poppins font-semibold text-charcoal">
                  Available Times
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto pr-2">
                  {slotsByDate[selectedDate]?.map((slot) => {
                    const time = new Date(slot.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    });
                    const isSelected = selectedTime === slot.id;
                    const isReserved = isSlotReserved(slot.id);
                    const isReservedByOthers =
                      (slot.statusInfo?.isReserved && !isReserved) ||
                      (slot.status === 'RESERVED' && !isReserved);
                    const isBooked =
                      slot.statusInfo?.isBooked || slot.status === 'BOOKED' || slot.isBooked;

                    return (
                      <button
                        key={slot.id}
                        className={`relative p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-lg scale-105'
                            : isBooked
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                              : isReservedByOthers
                                ? 'border-yellow-200 bg-yellow-50 text-yellow-600 cursor-not-allowed opacity-60'
                                : 'border-gray-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-white hover:border-primary/50 hover:shadow-md'
                        }`}
                        onClick={() => {
                          if (!isReservedByOthers && !isBooked) {
                            handleSlotSelection(slot.id);
                          }
                        }}
                        disabled={isReservedByOthers || isBooked}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{time}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTime && (
                  <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Selected
                          </div>
                          <div className="text-base font-semibold text-charcoal">
                            {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) && (
                              <>
                                {new Date(
                                  slotsByDate[selectedDate]!.find(
                                    (s) => s.id === selectedTime,
                                  )!.startTime,
                                ).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                at{' '}
                                {new Date(
                                  slotsByDate[selectedDate]!.find(
                                    (s) => s.id === selectedTime,
                                  )!.startTime,
                                ).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        EUR{' '}
                        {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime)?.basePrice ||
                          0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-poppins font-bold text-charcoal">
                Confirm Your Appointment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
                Review your booking details and add any optional information
              </p>
            </div>

            {/* Appointment Summary Card */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                {/* Therapist Info */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={therapist?.avatar} />
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {therapist?.name?.charAt(0) || 'T'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-poppins font-bold text-charcoal">
                      {therapist?.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {therapist?.specialty}
                    </p>
                    {therapist?.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {therapist.rating.toFixed(1)} ({therapist.reviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time Summary */}
                {selectedDate && selectedTime && (
                  <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <h4 className="font-poppins font-semibold text-charcoal">Appointment Time</h4>
                    </div>
                    <div className="pl-7 space-y-1">
                      <p className="font-medium text-lg text-gray-900 dark:text-white">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-primary font-semibold text-lg">
                        {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                          new Date(
                            slotsByDate[selectedDate]!.find(
                              (s) => s.id === selectedTime,
                            )!.startTime,
                          ).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional Details Form */}
                <div className="space-y-6">
                  {/* Services Selection */}
                  {availableServices && availableServices.length > 0 ? (
                    <div className="space-y-4">
                      <Label className="text-lg font-poppins font-semibold text-charcoal">
                        Available Services for This Slot
                      </Label>
                      <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
                        Select from services available for your selected time slot
                      </p>
                      <div className="grid gap-3">
                        {availableServices.map((service: any) => (
                          <div key={service.id} className="relative">
                            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                checked={
                                  serviceForm.watch('serviceCategoryIds')?.includes(service.id) ||
                                  false
                                }
                                onChange={(e) => {
                                  const currentServiceIds =
                                    serviceForm.watch('serviceCategoryIds') || [];
                                  if (e.target.checked) {
                                    serviceForm.setValue('serviceCategoryIds', [
                                      ...currentServiceIds,
                                      service.id,
                                    ]);
                                  } else {
                                    serviceForm.setValue(
                                      'serviceCategoryIds',
                                      currentServiceIds.filter((id) => id !== service.id),
                                    );
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {service.name}
                                </div>
                                {service.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {service.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {service.locationTypes?.map((type: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                                    >
                                      {type === 'VIRTUAL' ? (
                                        <Video className="w-3 h-3" />
                                      ) : type === 'OFFICE' ? (
                                        <Building className="w-3 h-3" />
                                      ) : (
                                        <Home className="w-3 h-3" />
                                      )}
                                      {type === 'VIRTUAL'
                                        ? 'Online'
                                        : type === 'OFFICE'
                                          ? 'Office'
                                          : 'Home'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedTime ? (
                    <div className="space-y-4">
                      <Label className="text-lg font-poppins font-semibold text-charcoal">
                        Services
                      </Label>
                      <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        No specific services are configured for this time slot. You can discuss your
                        needs directly with the therapist during your session.
                      </div>
                    </div>
                  ) : null}

                  {/* Additional Notes */}
                  <div className="space-y-4">
                    <Label
                      htmlFor="notes"
                      className="text-lg font-poppins font-semibold text-charcoal"
                    >
                      Additional Notes (Optional)
                    </Label>
                    <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
                      Share any specific concerns, goals, or preferences for your session
                    </p>
                    <Textarea
                      id="notes"
                      placeholder="e.g., I'd like to focus on anxiety management techniques..."
                      className="min-h-[120px] resize-none"
                      {...detailsForm.register('notes')}
                    />
                  </div>

                  {/* Address for Home Sessions */}
                  {serviceForm.watch('serviceCategoryIds')?.some((id) => {
                    const service = availableServices?.find((s: any) => s.id === id);
                    return service?.locationTypes?.includes('HOME');
                  }) && (
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-600" />
                        <Label
                          htmlFor="clientAddress"
                          className="text-lg font-poppins font-semibold text-blue-900 dark:text-blue-100"
                        >
                          Home Address
                        </Label>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Please provide your address for home visit sessions
                      </p>
                      <Input
                        id="clientAddress"
                        placeholder="Enter your full address"
                        className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                        {...detailsForm.register('clientAddress')}
                      />
                    </div>
                  )}

                  {/* Price Summary */}
                  {selectedTime && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Session Price
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          EUR{' '}
                          {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime)?.basePrice}
                        </span>
                      </div>
                      {therapist?.id && (
                        <div className="mt-4">
                          <StampDiscountBadge therapistId={therapist.id} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cal.com/Calendly Style - Centered Single Column */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Compact Therapist Header */}
        <div className="mb-6 flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={prevStep}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={therapist?.avatar} />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {therapist?.name?.charAt(0) || 'T'}
            </div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-poppins font-bold text-charcoal truncate">
              {therapist?.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {therapist?.specialty}
              </p>
              {therapist?.rating && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{therapist?.rating?.toFixed(1)}</span>
                    {therapist?.reviews > 0 && (
                      <span className="text-xs text-gray-500">({therapist?.reviews})</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentStep >= step.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Sticky Action Button at Bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 -mx-4 px-4 py-4 -mb-8 mt-8 rounded-t-xl shadow-lg">
          <div className="max-w-3xl mx-auto">
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-semibold"
                size="lg"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleCompleteBooking}
                disabled={bookingLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 h-12 text-base font-semibold"
                size="lg"
              >
                {bookingLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Confirming...
                  </>
                ) : (
                  'Confirm and book'
                )}
              </Button>
            )}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">Free cancellation up to 24 hours before</p>
            </div>
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
              <div>Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
              <div>Reserved: {reservedSlots.length}</div>
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
