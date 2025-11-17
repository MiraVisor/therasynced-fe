'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Home,
  Sparkles,
  Star,
  Video,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { z } from 'zod';

import SocketDebugger from '@/components/debug/SocketDebugger';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useSocketSlots } from '@/hooks/useSocketSlots';
import { rescheduleBooking } from '@/redux/api/exploreApi';
import { getStampDetail } from '@/redux/api/loyaltyApi';
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
  const { slots } = useSelector((state: RootState) => state.overview);
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

  // Load more slots when needed
  const loadMoreSlots = async () => {
    if (!freelancerId || loadingMoreSlots) return;

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
    } catch (error) {
      // Failed to load more slots
    } finally {
      setLoadingMoreSlots(false);
    }
  };

  // Handle slot selection with reservation
  const handleSlotSelection = (slotId: string) => {
    // Release previously selected slot if any
    if (selectedTime && selectedTime !== slotId) {
      releaseSlot(selectedTime);
    }

    // Reserve the new slot
    if (slotId !== selectedTime) {
      reserveSlot(slotId, 300000); // 5 minutes reservation
      toast.info('Slot reserved for 5 minutes. Complete your booking to confirm.');
    }

    setSelectedTime(slotId);
  };

  // Cleanup reservations on unmount - use useCallback to prevent infinite loops
  const cleanupReservations = useCallback(() => {
    if (selectedTime) {
      releaseSlot(selectedTime);
    }
  }, [selectedTime, releaseSlot]);

  useEffect(() => {
    return () => {
      cleanupReservations();
    };
  }, [cleanupReservations]);

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
        experience: freelancerData.yearsOfExperience || '0+ years',
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
      reviews: firstSlot.numberOfRatings || firstSlot.freelancer?.patientStories || 0,
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
  const formatDateForAPI = (date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  };

  // Group slots by date - show all slots with different visual indicators
  const slotsByDate: { [date: string]: any[] } = {};
  slots?.forEach((slot: any) => {
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
    { id: 1, title: 'Schedule', icon: Calendar, description: 'Pick your date & time' },
    { id: 2, title: 'Details', icon: FileText, description: 'Add session details' },
    { id: 3, title: 'Confirm', icon: CheckCircle, description: 'Review & book' },
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && selectedTime;
      case 2:
        return true; // Details are optional
      case 3:
        return true;
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
        isValid = await detailsForm.trigger();
        break;
      case 3:
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
          router.push('/dashboard/my-bookings');
        } else {
          throw new Error(result.payload || 'Failed to book appointment');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Select a date & time
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Choose when you&apos;d like to meet with {therapist?.name}
              </p>
            </div>

            {/* Stamps Information Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Earn Stamps with Every Booking
                    </h3>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                      Book appointments to earn stamps and unlock discounts on future sessions with
                      this therapist!
                    </p>
                    <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                      <li>
                        Earn 1 stamp for each completed appointment (stamps are awarded after your
                        therapist marks the appointment as completed)
                      </li>
                      <li>Reach 5 stamps to unlock a 15% discount reward</li>
                      <li>
                        Discounts are automatically applied to your next booking with the same
                        therapist
                      </li>
                      <li>Stamps are grouped separately for each therapist</li>
                    </ul>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
                      View your stamp progress in Account Settings → Stamps
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            <div className="space-y-8">
              {/* Date Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Date
                  </h3>
                  {totalDatePages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDatePage(Math.max(0, datePage - 1))}
                        disabled={datePage === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-500 min-w-[80px] text-center">
                        {currentDatePage + 1} / {totalDatePages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDatePage(Math.min(totalDatePages - 1, datePage + 1))}
                        disabled={datePage >= totalDatePages - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {displayedDates?.map((date) => {
                    const dateObj = new Date(date);
                    const isToday = date === formatDateForAPI(new Date());
                    const isSelected = selectedDate === date;
                    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

                    return (
                      <button
                        key={date}
                        className={`relative p-3 rounded-xl border transition-all duration-200 hover:border-gray-300 ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-center space-y-1">
                          <div
                            className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}
                          >
                            {dayOfWeek}
                          </div>
                          <div
                            className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                          >
                            {dayNumber}
                          </div>
                          <div
                            className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}
                          >
                            {month}
                          </div>
                        </div>
                        {isToday && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div
                              className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}
                            ></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Load more dates */}
                {availableDates.length > (currentDatePage + 1) * datesPerPage && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreSlots}
                      disabled={loadingMoreSlots}
                      className="px-8"
                    >
                      {loadingMoreSlots ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Loading...
                        </>
                      ) : (
                        'Load More Dates'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Times
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
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
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                            isSelected
                              ? 'border-primary bg-primary text-white shadow-lg'
                              : isBooked
                                ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                : isReservedByOthers
                                  ? 'border-yellow-200 bg-yellow-50 text-yellow-600 cursor-not-allowed opacity-60'
                                  : 'border-gray-200 bg-white hover:border-primary hover:shadow-md text-gray-900 dark:bg-gray-800 dark:text-white'
                          }`}
                          onClick={() => {
                            if (!isReservedByOthers && !isBooked) {
                              handleSlotSelection(slot.id);
                            }
                          }}
                          disabled={isReservedByOthers || isBooked}
                        >
                          <div className="text-center">
                            <div>{time}</div>
                            {isSelected && <div className="text-xs mt-1 opacity-90">Selected</div>}
                            {isBooked && <div className="text-xs mt-1">Booked</div>}
                            {isReservedByOthers && <div className="text-xs mt-1">Reserved</div>}
                          </div>
                          {selectedTime === slot.id && (
                            <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTime && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900 dark:text-green-100">
                            Time Selected
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">
                            {new Date(
                              slotsByDate[selectedDate].find(
                                (s) => s.id === selectedTime,
                              )?.startTime,
                            ).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}{' '}
                            at{' '}
                            {new Date(
                              slotsByDate[selectedDate].find(
                                (s) => s.id === selectedTime,
                              )?.startTime,
                            ).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                        <div className="ml-auto font-bold text-green-900 dark:text-green-100">
                          €{slotsByDate[selectedDate].find((s) => s.id === selectedTime)?.basePrice}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tell us about your session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Help {therapist?.name} prepare for your appointment (optional)
              </p>
            </div>

            {/* Session Details Form */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Services Selection */}
              {availableServices && availableServices.length > 0 ? (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Services for This Slot
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select from services available for your selected time slot
                  </p>
                  <div className="grid gap-3">
                    {availableServices.map((service: any) => (
                      <div key={service.id} className="relative">
                        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            checked={
                              serviceForm.watch('serviceCategoryIds')?.includes(service.id) || false
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
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Additional Notes (Optional)
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      className="text-lg font-semibold text-blue-900 dark:text-blue-100"
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm your booking
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Review your appointment details and complete your booking
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Appointment Summary Card */}
              <Card className="border-2 border-primary bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
                <CardContent className="p-8">
                  {/* Therapist Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-3 border-primary">
                      <AvatarImage src={therapist?.avatar} />
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {therapist?.name?.charAt(0) || 'T'}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {therapist?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {therapist?.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < (therapist?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {therapist?.rating?.toFixed(1)} ({therapist?.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date & Time */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Date & Time</h4>
                      </div>
                      <div className="pl-7">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedDate &&
                            new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                        </p>
                        <p className="text-primary font-semibold">
                          {selectedTime &&
                            slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                            new Date(
                              slotsByDate[selectedDate].find(
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

                    {/* Services */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Services</h4>
                      </div>
                      <div className="pl-7">
                        {(serviceForm?.watch('serviceCategoryIds')?.length ?? 0) > 0 ? (
                          <div className="space-y-1">
                            {serviceForm.watch('serviceCategoryIds')?.map((id: string) => {
                              const service = therapist?.services?.find((s: any) => s.id === id);
                              return (
                                <p key={id} className="text-gray-900 dark:text-white font-medium">
                                  {service?.name || 'Unknown Service'}
                                </p>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400">
                            General therapy session
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(detailsForm.watch('notes') || detailsForm.watch('clientAddress')) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Additional Details
                      </h4>
                      <div className="space-y-3">
                        {detailsForm.watch('notes') && (
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Notes:
                            </span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {detailsForm.watch('notes')}
                            </p>
                          </div>
                        )}
                        {detailsForm.watch('clientAddress') && (
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Address:
                            </span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {detailsForm.watch('clientAddress')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stamp Discount Badge */}
                  {therapist?.id && (
                    <div className="mt-6">
                      <StampDiscountBadge therapistId={therapist.id} />
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {selectedTime &&
                    (() => {
                      const selectedSlot = slotsByDate[selectedDate]?.find(
                        (s) => s.id === selectedTime,
                      );
                      const basePrice = selectedSlot?.basePrice || 0;
                      const hasDiscount =
                        stampDetail?.rewardReady &&
                        !stampDetail?.rewardReserved &&
                        stampDetail?.therapist?.id === therapist?.id;
                      const discountPercentage = hasDiscount
                        ? stampDetail?.discountPercentage || 0
                        : 0;
                      const discountAmount = hasDiscount
                        ? (basePrice * discountPercentage) / 100
                        : 0;
                      const finalPrice = basePrice - discountAmount;

                      return (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                              <span className="text-gray-900 dark:text-white">
                                €{basePrice.toFixed(2)}
                              </span>
                            </div>
                            {hasDiscount && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    Stamp Discount ({discountPercentage}%):
                                  </span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    -€{discountAmount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                      Total Price:
                                    </span>
                                    <div className="flex flex-col items-end">
                                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        €{finalPrice.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-gray-500 line-through">
                                        €{basePrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            {!hasDiscount && (
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Total Price:
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                  €{basePrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          {hasDiscount && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                ✓ Your {discountPercentage}% stamp discount has been applied
                                automatically!
                              </p>
                            </div>
                          )}
                          {!hasDiscount && (
                            <p className="text-xs text-gray-500 mt-2">
                              *Any available stamp discounts will be applied automatically
                            </p>
                          )}
                        </div>
                      );
                    })()}
                </CardContent>
              </Card>

              {/* Important Information */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Important Information
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>
                          • Your slot is reserved for 5 minutes. Complete your booking to confirm.
                        </li>
                        <li>• You&apos;ll receive a confirmation email with session details.</li>
                        <li>• Cancellation is free up to 24 hours before your appointment.</li>
                        <li>• Please arrive 5 minutes early for your session.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
    <div className="min-h-screen">
      {/* Header with Progress */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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

            {/* Simple Progress Indicator */}
            <div className="flex-1 max-w-md mx-auto px-8">
              <div className="flex items-center justify-between text-sm">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentStep >= step.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {steps.map((step) => (
                  <div key={step.id} className="text-xs text-gray-500 text-center">
                    {step.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="w-24 flex justify-end">
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-6"
                >
                  Continue
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Airbnb layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {renderStepContent()}
            </div>
          </div>

          {/* Right Column - Booking Summary (Airbnb-style sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {currentStep !== steps.length && (
                <>
                  {/* Therapist Info */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <Avatar className="w-16 h-16 border-2 border-gray-200">
                      <AvatarImage src={therapist?.avatar} />
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {therapist?.name?.charAt(0) || 'T'}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {therapist?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{therapist?.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{therapist?.rating?.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">
                          ({therapist?.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Your booking</h4>

                    {/* Date & Time */}
                    {selectedDate && selectedTime && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                                new Date(
                                  slotsByDate[selectedDate].find(
                                    (s) => s.id === selectedTime,
                                  )!.startTime,
                                ).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                            </div>
                          </div>
                        </div>
                        {currentStep === 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/5"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Services */}
                    {(serviceForm?.watch('serviceCategoryIds')?.length ?? 0) > 0 && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Services
                            </div>
                            <div className="text-sm text-gray-500">
                              {serviceForm
                                .watch('serviceCategoryIds')
                                ?.map((id: string) => {
                                  const service = therapist?.services?.find(
                                    (s: any) => s.id === id,
                                  );
                                  return service?.name;
                                })
                                .join(', ')}
                            </div>
                          </div>
                        </div>
                        {currentStep === 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/5"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {selectedTime &&
                      (() => {
                        const selectedSlot = slotsByDate[selectedDate]?.find(
                          (s) => s.id === selectedTime,
                        );
                        const basePrice = selectedSlot?.basePrice || 0;
                        const hasDiscount =
                          stampDetail?.rewardReady &&
                          !stampDetail?.rewardReserved &&
                          stampDetail?.therapist?.id === therapist?.id;
                        const discountPercentage = hasDiscount
                          ? stampDetail?.discountPercentage || 0
                          : 0;
                        const discountAmount = hasDiscount
                          ? (basePrice * discountPercentage) / 100
                          : 0;
                        const finalPrice = basePrice - discountAmount;

                        return (
                          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                              {hasDiscount && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Base Price:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      €{basePrice.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      Stamp Discount ({discountPercentage}%):
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      -€{discountAmount.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Total
                                      </span>
                                      <div className="flex flex-col items-end">
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                          €{finalPrice.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-500 line-through">
                                          €{basePrice.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                      ✓ {discountPercentage}% stamp discount applied
                                    </p>
                                  </div>
                                </>
                              )}
                              {!hasDiscount && (
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Total
                                  </span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    €{basePrice.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                </>
              )}

              {/* Complete Booking Button */}
              {currentStep === steps.length && (
                <Button
                  onClick={handleCompleteBooking}
                  disabled={bookingLoading}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-50 py-3 text-base font-semibold rounded-lg text-white"
                >
                  {bookingLoading ? <>Confirming...</> : 'Confirm and book'}
                </Button>
              )}

              {/* Policy Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 space-y-2">
                  <p>• Free cancellation up to 24 hours before</p>
                  <p>• You&apos;ll receive confirmation details via email</p>
                  <p>• This therapist typically responds within an hour</p>
                </div>
              </div>
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
