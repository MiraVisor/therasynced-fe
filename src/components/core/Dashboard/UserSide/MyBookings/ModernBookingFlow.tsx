'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Star,
  Video,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { z } from 'zod';

import SocketDebugger from '@/components/debug/SocketDebugger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSocketSlots } from '@/hooks/useSocketSlots';
import { rescheduleBooking } from '@/redux/api/exploreApi';
import { bookAppointment, fetchFreelancerSlots } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { isSlotAvailable } from '@/utils/slotUtils';

// Form validation schemas
const serviceSchema = z.object({
  serviceIds: z.array(z.string()).optional(),
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
}

const ModernBookingFlow: React.FC<ModernBookingFlowProps> = ({ rescheduleBookingId }) => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const freelancerId = Array.isArray(params?.freelancerId)
    ? params?.freelancerId[0]
    : params?.freelancerId;
  const { slots } = useSelector((state: RootState) => state.overview);

  // Use WebSocket hook for real-time slot updates
  const { isConnected, reservedSlots, reserveSlot, releaseSlot, isSlotReserved } =
    useSocketSlots(freelancerId);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [datePage, setDatePage] = useState(0);
  const [loadingMoreSlots, setLoadingMoreSlots] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  // Form states
  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { serviceIds: [] },
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
      console.error('Failed to load more slots:', error);
    } finally {
      setLoadingMoreSlots(false);
    }
  };

  // Handle slot selection with reservation
  const handleSlotSelection = (slotId: string) => {
    console.log('Slot selection triggered:', slotId);
    console.log('Current selected time:', selectedTime);
    console.log('Current reserved slots:', reservedSlots);

    // Release previously selected slot if any
    if (selectedTime && selectedTime !== slotId) {
      console.log('Releasing previous slot:', selectedTime);
      releaseSlot(selectedTime);
    }

    // Reserve the new slot
    if (slotId !== selectedTime) {
      console.log('Reserving new slot:', slotId);
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

  // Debug: Monitor reserved slots changes
  useEffect(() => {
    console.log('Reserved slots changed:', reservedSlots);
  }, [reservedSlots]);

  // Extract freelancer info from API data
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;
  const therapist = firstSlot
    ? {
        id: firstSlot.freelancerId,
        name: firstSlot.freelancer?.name,
        specialty: firstSlot.freelancer?.mainService,
        rating: firstSlot.freelancer?.averageRating,
        reviews: firstSlot.freelancer?.patientStories,
        avatar: firstSlot.freelancer?.profilePicture,
        experience: firstSlot.freelancer?.yearsOfExperience
          ? `${firstSlot.freelancer.yearsOfExperience}+ years`
          : firstSlot.freelancer?.createdAt
            ? `${Math.floor((new Date().getTime() - new Date(firstSlot.freelancer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))}+ years`
            : undefined,
        location: firstSlot.freelancer?.locations?.[0]?.name,
        services: firstSlot.freelancer?.services || [],
        sessionTypes: firstSlot.freelancer?.sessionTypes || [],
        pricing: firstSlot.freelancer?.pricing,
        description: firstSlot.freelancer?.description,
        languages: firstSlot.freelancer?.languages || [],
        education: firstSlot.freelancer?.education || [],
        certifications: firstSlot.freelancer?.certifications || [],
        availableSlots: firstSlot.freelancer?.slotSummary?.availableSlots,
        totalSlots: firstSlot.freelancer?.slotSummary?.totalSlots,
        nextAvailableSlot: firstSlot.freelancer?.slotSummary?.nextAvailable,
        cardInfo: firstSlot.freelancer?.cardInfo,
        isFavorite: firstSlot.freelancer?.isFavorite,
      }
    : null;

  // Group slots by date - show all slots with different visual indicators
  const slotsByDate: { [date: string]: any[] } = {};
  slots?.forEach((slot: any) => {
    // Show all slots (available, reserved, booked) with different visual indicators
    const date = new Date(slot.startTime).toISOString().split('T')[0];
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
    { id: 1, title: 'Service Type', icon: Video, description: 'Choose your session type' },
    { id: 2, title: 'Schedule', icon: Calendar, description: 'Pick date & time' },
    { id: 3, title: 'Details', icon: FileText, description: 'Session details' },
    { id: 4, title: 'Summary', icon: CheckCircle, description: 'Review & confirm' },
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await serviceForm.trigger();
        break;
      case 2:
        if (selectedDate && selectedTime) {
          isValid = true;
        } else {
          toast.error('Please select both a date and time');
          return;
        }
        break;
      case 3:
        isValid = await detailsForm.trigger();
        break;
      case 4:
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

    // Check if slot is still available
    const selectedSlot = slots?.find((slot: any) => slot.id === selectedTime);
    if (!selectedSlot || !isSlotAvailable(selectedSlot)) {
      toast.error('Selected slot is no longer available. Please choose another time.');
      return;
    }

    setBookingLoading(true);
    try {
      const serviceData = serviceForm.getValues();
      const detailsData = detailsForm.getValues();

      const bookingData = {
        slotId: selectedTime,
        serviceIds: serviceData.serviceIds,
        notes: detailsData.notes,
        clientAddress: detailsData.clientAddress,
      };

      if (rescheduleBookingId) {
        await rescheduleBooking(rescheduleBookingId, selectedTime);
        toast.success('Appointment rescheduled successfully!');
      } else {
        // Use Redux action instead of direct fetch
        const result = await dispatch(bookAppointment(bookingData) as any);

        if (bookAppointment.fulfilled.match(result)) {
          toast.success('Appointment booked successfully!');
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Choose Your Session Type
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select how you&apos;d like to meet with {therapist?.name}
              </p>
            </div>

            <div className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Select Services</Label>
                <div className="space-y-4">
                  {therapist?.services && therapist.services.length > 0 ? (
                    therapist.services.map((service: any) => (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {service.locationTypes?.includes('VIRTUAL') ? (
                              <Video className="w-5 h-5 text-primary" />
                            ) : service.locationTypes?.includes('OFFICE') ? (
                              <Building className="w-5 h-5 text-primary" />
                            ) : (
                              <Home className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Select
                              value={
                                serviceForm.watch('serviceIds')?.includes(service.id)
                                  ? service.id
                                  : ''
                              }
                              onValueChange={(value) => {
                                const currentServiceIds = serviceForm.watch('serviceIds') || [];
                                if (value === service.id) {
                                  if (!currentServiceIds.includes(service.id)) {
                                    serviceForm.setValue('serviceIds', [
                                      ...currentServiceIds,
                                      service.id,
                                    ]);
                                  }
                                } else {
                                  serviceForm.setValue(
                                    'serviceIds',
                                    currentServiceIds.filter((id) => id !== service.id),
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={`Select ${service.name}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={service.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{service.name}</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="">
                                  <span className="text-gray-500">None</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {serviceForm.watch('serviceIds')?.includes(service.id) && (
                          <div className="ml-8 space-y-2">
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {service.locationTypes?.map((type: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {type === 'VIRTUAL'
                                      ? 'Online'
                                      : type === 'OFFICE'
                                        ? 'Office'
                                        : type === 'HOME'
                                          ? 'Home'
                                          : type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Video className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <Select disabled>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="No services available" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-gray-500">No services available</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="ml-8">
                        <p className="text-sm text-gray-500">
                          This therapist doesn&apos;t have any services configured yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Duration */}
              {/* <div className="space-y-4">
                <Label className="text-base font-medium">Session Duration</Label>
                <Select
                  value={serviceForm.watch('sessionDuration')}
                  onValueChange={(value) => serviceForm.setValue('sessionDuration', value as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {['30', '45', '60', '90'].map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Service Summary */}
              {(serviceForm?.watch('serviceIds')?.length ?? 0) > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Selected Services</h4>
                  <div className="space-y-2">
                    {(serviceForm?.watch('serviceIds') ?? []).map((serviceId: string) => {
                      const service = therapist?.services?.find((s: any) => s.id === serviceId);
                      return (
                        <div key={serviceId} className="flex items-center justify-between text-sm">
                          <span>{service?.name || 'Unknown Service'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Date & Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose when you&apos;d like to meet
              </p>

              {/* Real-time connection status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Live updates enabled</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Offline mode</span>
                  </>
                )}
              </div>

              {/* Debug toggle */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebugger(!showDebugger)}
                  className="text-xs"
                >
                  {showDebugger ? 'Hide' : 'Show'} Debug Info
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Available Dates</Label>

                {/* Date pagination controls */}
                {totalDatePages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePage(Math.max(0, datePage - 1))}
                      disabled={datePage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentDatePage + 1} of {totalDatePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePage(Math.min(totalDatePages - 1, datePage + 1))}
                      disabled={datePage >= totalDatePages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {displayedDates?.map((date) => {
                    const dateObj = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    const isSelected = selectedDate === date;

                    return (
                      <Card
                        key={date}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm font-medium">
                            {isToday
                              ? 'Today'
                              : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-xs text-gray-600">
                            {dateObj.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Load more dates button */}
                {availableDates.length > (currentDatePage + 1) * datesPerPage && (
                  <Button
                    variant="outline"
                    onClick={loadMoreSlots}
                    disabled={loadingMoreSlots}
                    className="w-full"
                  >
                    {loadingMoreSlots ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Loading more dates...
                      </>
                    ) : (
                      'Load More Dates'
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Time Slots</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {selectedDate &&
                    slotsByDate[selectedDate]?.map((slot) => {
                      const time = new Date(slot.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      });
                      const isSelected = selectedTime === slot.id;
                      const isReserved = isSlotReserved(slot.id);
                      // Check if slot is reserved by others using new statusInfo structure
                      const isReservedByOthers =
                        (slot.statusInfo?.isReserved && !isReserved) ||
                        (slot.status === 'RESERVED' && !isReserved);
                      // Check if slot is booked
                      const isBooked =
                        slot.statusInfo?.isBooked || slot.status === 'BOOKED' || slot.isBooked;

                      return (
                        <Card
                          key={slot.id}
                          className={`transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5 cursor-pointer'
                              : isBooked
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 cursor-not-allowed opacity-60'
                                : isReservedByOthers
                                  ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 cursor-not-allowed opacity-60'
                                  : 'border-gray-200 hover:border-primary/30 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isReservedByOthers && !isBooked) {
                              handleSlotSelection(slot.id);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-sm font-medium">{time}</div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {isSelected ? (
                                <Badge className="text-xs bg-primary text-white">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Reserved
                                </Badge>
                              ) : isBooked ? (
                                <Badge className="text-xs bg-red-100 text-red-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Booked
                                </Badge>
                              ) : isReservedByOthers ? (
                                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Reserved
                                </Badge>
                              ) : (
                                <div className="text-xs text-gray-600">Available</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Debug Info */}
            {showDebugger && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Debug Information:</h4>
                <div className="text-xs space-y-2">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>Selected Date: {selectedDate || 'None'}</div>
                    <div>Selected Time: {selectedTime || 'None'}</div>
                    <div>Reserved Slots: {reservedSlots.length}</div>
                    <div>Socket Connected: {isConnected ? 'Yes' : 'No'}</div>
                    <div>Total Slots: {slots?.length || 0}</div>
                    <div>
                      Available Slots:{' '}
                      {slots?.filter((slot: any) => isSlotAvailable(slot)).length || 0}
                    </div>
                  </div>

                  {/* Slot Status Breakdown */}
                  <div className="mt-3">
                    <div className="font-medium mb-1">Slot Status Breakdown:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        Available:{' '}
                        {slots?.filter((s: any) => s.statusInfo?.isAvailable).length || 0}
                      </div>
                      <div>
                        Reserved: {slots?.filter((s: any) => s.statusInfo?.isReserved).length || 0}
                      </div>
                      <div>
                        Booked: {slots?.filter((s: any) => s.statusInfo?.isBooked).length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Slot Details */}
                {selectedTime && (
                  <div className="mt-3">
                    <div className="font-medium mb-1">Selected Slot Details:</div>
                    {(() => {
                      const selectedSlot = slots?.find((s: any) => s.id === selectedTime);
                      if (selectedSlot) {
                        return (
                          <div className="bg-white dark:bg-gray-700 p-2 rounded text-xs">
                            <div>ID: {selectedSlot.id}</div>
                            <div>Status: {selectedSlot.status}</div>
                            {selectedSlot.statusInfo && (
                              <>
                                <div>Status Info:</div>
                                <div className="ml-2">
                                  <div>
                                    • Available:{' '}
                                    {selectedSlot.statusInfo.isAvailable ? 'Yes' : 'No'}
                                  </div>
                                  <div>
                                    • Reserved: {selectedSlot.statusInfo.isReserved ? 'Yes' : 'No'}
                                  </div>
                                  <div>
                                    • Booked: {selectedSlot.statusInfo.isBooked ? 'Yes' : 'No'}
                                  </div>
                                  <div>
                                    • Can Be Reserved:{' '}
                                    {selectedSlot.statusInfo.canBeReserved ? 'Yes' : 'No'}
                                  </div>
                                  {selectedSlot.statusInfo.reservedUntil && (
                                    <div>
                                      • Reserved Until:{' '}
                                      {new Date(
                                        selectedSlot.statusInfo.reservedUntil,
                                      ).toLocaleString()}
                                    </div>
                                  )}
                                  <div>• Message: {selectedSlot.statusInfo.statusMessage}</div>
                                </div>
                              </>
                            )}
                            <div>Is Booked: {selectedSlot.isBooked ? 'Yes' : 'No'}</div>
                            <div>Start: {new Date(selectedSlot.startTime).toLocaleString()}</div>
                            <div>End: {new Date(selectedSlot.endTime).toLocaleString()}</div>
                            <div>
                              Duration:{' '}
                              {Math.round(
                                (new Date(selectedSlot.endTime).getTime() -
                                  new Date(selectedSlot.startTime).getTime()) /
                                  60000,
                              )}
                              min
                            </div>
                            <div>Price: ${selectedSlot.price || 'N/A'}</div>
                            <div>Is Reserved: {isSlotReserved(selectedSlot.id) ? 'Yes' : 'No'}</div>
                          </div>
                        );
                      }
                      return <div className="text-red-500">Selected slot not found in data</div>;
                    })()}
                  </div>
                )}

                {/* Reserved Slots List */}
                {reservedSlots.length > 0 && (
                  <div className="mt-3">
                    <div className="font-medium mb-1">Reserved Slots ({reservedSlots.length}):</div>
                    <div className="max-h-20 overflow-y-auto">
                      {reservedSlots.map((slotId: string, index: number) => {
                        const slot = slots?.find((s: any) => s.id === slotId);
                        return (
                          <div
                            key={slotId}
                            className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-1 rounded mb-1"
                          >
                            {index + 1}. {slotId} -{' '}
                            {slot ? new Date(slot.startTime).toLocaleTimeString() : 'Unknown time'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Slot Events */}
                <div className="mt-3">
                  <div className="font-medium mb-1">Slot Availability Check:</div>
                  <div className="text-xs">
                    {selectedTime &&
                      (() => {
                        const slot = slots?.find((s: any) => s.id === selectedTime);
                        if (slot) {
                          const isAvailable = isSlotAvailable(slot);
                          return (
                            <div
                              className={`p-2 rounded ${isAvailable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                            >
                              <div>Slot Available: {isAvailable ? '✅ Yes' : '❌ No'}</div>
                              <div>Status: {slot.status}</div>
                              {slot.statusInfo && (
                                <>
                                  <div>Status Message: {slot.statusInfo.statusMessage}</div>
                                  <div>
                                    Can Be Reserved: {slot.statusInfo.canBeReserved ? 'Yes' : 'No'}
                                  </div>
                                  {slot.statusInfo.reservedUntil && (
                                    <div>
                                      Reserved Until:{' '}
                                      {new Date(slot.statusInfo.reservedUntil).toLocaleString()}
                                    </div>
                                  )}
                                </>
                              )}
                              <div>Is Booked: {slot.isBooked ? 'Yes' : 'No'}</div>
                              <div>Is Reserved: {isSlotReserved(slot.id) ? 'Yes' : 'No'}</div>
                            </div>
                          );
                        }
                        return <div className="text-red-500">Slot not found</div>;
                      })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Session Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help us understand your needs better
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns or preferences..."
                  className="mt-2"
                  {...detailsForm.register('notes')}
                />
              </div>

              {serviceForm.watch('serviceIds')?.some((id) => {
                const service = therapist?.services?.find((s: any) => s.id === id);
                return service?.locationTypes?.includes('HOME');
              }) && (
                <div>
                  <Label htmlFor="clientAddress" className="text-base font-medium">
                    Home Address
                  </Label>
                  <Input
                    id="clientAddress"
                    placeholder="Enter your home address"
                    className="mt-2"
                    {...detailsForm.register('clientAddress')}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Review Your Booking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please review your appointment details before confirming
              </p>
            </div>

            {/* Freelancer Banner */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={therapist?.avatar} />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {therapist?.name?.charAt(0) || 'T'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {therapist?.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <span className="font-medium">{therapist?.specialty}</span>
                      <span>•</span>
                      <span>{therapist?.experience}</span>
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (therapist?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          ({therapist?.rating?.toFixed(1)})
                        </span>
                      </div>
                      {therapist?.reviews && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{therapist.reviews} reviews</span>
                        </>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{therapist?.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <p className="font-medium capitalize">
                      {(serviceForm?.watch('serviceIds')?.length ?? 0) > 0
                        ? serviceForm
                            .watch('serviceIds')
                            ?.map((id: string) => {
                              const service = therapist?.services?.find((s: any) => s.id === id);
                              return service?.name || 'Unknown Service';
                            })
                            ?.join(', ')
                        : 'General Session'}
                    </p>
                  </div>
                  {/* <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{serviceForm?.watch('sessionDuration')} minutes</p>
                  </div> */}
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">
                      {selectedDate &&
                        new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">
                      {selectedTime &&
                        slotsByDate[selectedDate]?.find((s) => s.id === selectedTime) &&
                        new Date(
                          slotsByDate[selectedDate].find((s) => s.id === selectedTime)!.startTime,
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                    </p>
                  </div>
                </div>

                {/* Session Details */}
                {(detailsForm.watch('notes') || detailsForm.watch('clientAddress')) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-2">Session Details</h5>
                    <div className="space-y-2">
                      {detailsForm.watch('notes') && (
                        <div>
                          <span className="text-gray-600 text-sm">Notes:</span>
                          <p className="text-sm">{detailsForm.watch('notes')}</p>
                        </div>
                      )}
                      {detailsForm.watch('clientAddress') && (
                        <div>
                          <span className="text-gray-600 text-sm">Address:</span>
                          <p className="text-sm">{detailsForm.watch('clientAddress')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Information */}
                {(serviceForm?.watch('serviceIds')?.length ?? 0) > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Session Price:</span>
                      <span className="font-semibold text-lg text-primary">
                        €
                        {serviceForm
                          .watch('serviceIds')
                          ?.reduce((total: number, serviceId: string) => {
                            const service = therapist?.services?.find(
                              (s: any) => s.id === serviceId,
                            );
                            return total + (service?.price || 0);
                          }, 0) || 0}
                      </span>
                    </div>
                  </div>
                )}
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading therapist information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    currentStep >= step.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 transition-all duration-200 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCompleteBooking}
            disabled={bookingLoading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            {bookingLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                Complete Booking
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Simple Debug Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
        <div className="flex items-center justify-between">
          <span>Debug Info:</span>
          <div className="flex items-center gap-4">
            <span>Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</span>
            <span>Reserved: {reservedSlots.length}</span>
            <span>Slots: {slots?.length || 0}</span>
            <span>Selected: {selectedTime ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Socket Debugger */}
      <SocketDebugger />
    </div>
  );
};

export default ModernBookingFlow;
