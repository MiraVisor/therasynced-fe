'use client';

import { format, parseISO, startOfToday } from 'date-fns';
import { AlertCircle, Building2, Calendar, Clock, Home } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
import { Textarea } from '@/components/ui/textarea';
import { useRescheduleBooking } from '@/hooks/queries/useBookings';
import { useProfile } from '@/hooks/queries/useProfile';
import { useAvailableSlotsByDate } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';
import { getApiErrorMessage } from '@/types/common';
import { LocationType } from '@/types/enums';

interface RescheduleBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  onSuccess?: () => void;
}

export function RescheduleBookingDialog({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: RescheduleBookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedServiceCategoryId, setSelectedServiceCategoryId] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<'HOME' | 'CLINIC' | null>(null);
  const [clientAddress, setClientAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const { data: userProfile } = useProfile();
  const { mutate: rescheduleBooking, isPending: isRescheduling } = useRescheduleBooking();

  // Get freelancer ID from booking
  const freelancerId = booking?.slot?.freelancer?.id;

  // Format date for API (YYYY-MM-DD)
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  // Fetch available slots for selected date and freelancer (now requires both)
  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlotsByDate({
    date: formattedDate || '',
    freelancerId: freelancerId || '',
    limit: 50,
  });

  const filteredSlots = slotsData || [];

  // Get selected slot data
  const selectedSlot = useMemo(() => {
    return filteredSlots.find((slot) => slot.id === selectedSlotId) || null;
  }, [filteredSlots, selectedSlotId]);

  // Get available location types from selected service category
  const availableLocationTypes = useMemo(() => {
    if (!selectedServiceCategoryId || !selectedSlot?.availableServiceCategories) return [];
    const selectedService = selectedSlot.availableServiceCategories.find(
      (cat) => cat.id === selectedServiceCategoryId,
    );
    if (!selectedService?.locationTypes) return [];
    return selectedService.locationTypes.filter(
      (loc): loc is 'HOME' | 'CLINIC' => loc === 'HOME' || loc === 'CLINIC',
    );
  }, [selectedSlot, selectedServiceCategoryId]);

  // Auto-select location if only one option
  useEffect(() => {
    if (availableLocationTypes.length === 1 && !locationType) {
      setLocationType(availableLocationTypes[0] || null);
    }
  }, [availableLocationTypes, locationType]);

  // Pre-populate address from user profile
  useEffect(() => {
    if (userProfile?.homeAddress && !clientAddress && locationType === LocationType.HOME) {
      setClientAddress(userProfile.homeAddress);
    }
  }, [userProfile?.homeAddress, locationType, clientAddress]);

  // Get available service categories from selected slot
  const availableServiceCategories = useMemo(() => {
    return selectedSlot?.availableServiceCategories || [];
  }, [selectedSlot]);

  // Auto-select service category if only one option or pre-select from current booking
  useEffect(() => {
    if (availableServiceCategories.length > 0 && !selectedServiceCategoryId) {
      // Try to match with current booking's service category
      const currentServiceCategoryId =
        booking?.serviceCategories?.[0]?.id || booking?.services?.[0]?.id;
      const matchingCategory = availableServiceCategories.find(
        (cat) => cat.id === currentServiceCategoryId,
      );

      if (matchingCategory) {
        setSelectedServiceCategoryId(matchingCategory.id);
      } else if (availableServiceCategories.length === 1) {
        // Auto-select if only one option
        setSelectedServiceCategoryId(availableServiceCategories[0]?.id ?? null);
      }
    }
  }, [availableServiceCategories, selectedServiceCategoryId, booking]);

  // Get service category IDs for API (use selected or fallback to current booking)
  const serviceCategoryIds = useMemo(() => {
    if (selectedServiceCategoryId) {
      return [selectedServiceCategoryId];
    }
    // Fallback to current booking's categories
    if (booking?.serviceCategories && booking.serviceCategories.length > 0) {
      return booking.serviceCategories.map((sc) => sc.id);
    }
    if (booking?.services && booking.services.length > 0) {
      return booking.services.map((s) => s.id);
    }
    return undefined;
  }, [selectedServiceCategoryId, booking]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedDate(null);
      setSelectedSlotId(null);
      setSelectedServiceCategoryId(null);
      setLocationType(null);
      setClientAddress('');
      setNotes('');
      setCancellationReason('');
    } else {
      // Set initial date to tomorrow or next available date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  }, [open]);

  // Reset service category when slot changes
  useEffect(() => {
    setSelectedServiceCategoryId(null);
  }, [selectedSlotId]);

  const handleReschedule = () => {
    if (!selectedSlotId) {
      toast.error('Please select a new time slot');
      return;
    }

    if (!selectedServiceCategoryId && availableServiceCategories.length > 0) {
      toast.error('Please select a service category');
      return;
    }

    if (locationType === LocationType.HOME && !clientAddress.trim()) {
      toast.error('Please enter your address for home visit bookings');
      return;
    }

    const rescheduleData = {
      bookingId: booking.id,
      newSlotId: selectedSlotId,
      serviceCategoryIds,
      locationType: locationType || undefined,
      clientAddress: locationType === LocationType.HOME ? clientAddress.trim() : undefined,
      notes: notes.trim() || undefined,
      cancellationReason: cancellationReason.trim() || undefined,
    };

    rescheduleBooking(rescheduleData, {
      onSuccess: () => {
        toast.success('Booking rescheduled successfully!');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error) || 'Failed to reschedule booking');
      },
    });
  };

  const today = startOfToday();

  // Get dates with available slots for calendar display

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment. Your current booking will be
            automatically cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Booking Info */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Current Appointment
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {booking?.slot?.startTime
                    ? format(parseISO(booking.slot.startTime), 'EEEE, MMMM d, yyyy')
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {booking?.slot?.startTime && booking?.slot?.endTime
                    ? `${format(parseISO(booking.slot.startTime), 'h:mm a')} - ${format(parseISO(booking.slot.endTime), 'h:mm a')}`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Select Date</Label>
              <p className="text-sm text-gray-500 mt-1">Choose a new date for your appointment</p>
            </div>
            <div className="border rounded-lg p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => {
                  setSelectedDate(date || null);
                  setSelectedSlotId(null); // Reset slot selection when date changes
                }}
                disabled={(date) => date < today}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                </Label>
                <p className="text-sm text-gray-500 mt-1">Select a time slot</p>
              </div>
              {isLoadingSlots ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                </div>
              ) : filteredSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredSlots.map((slot) => {
                    const slotDate = parseISO(slot.startTime);
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          // Reset location type when slot changes
                          setLocationType(null);
                        }}
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
              ) : (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No available slots</p>
                  <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
                </div>
              )}
            </div>
          )}

          {/* Service Category Selection */}
          {selectedSlot && availableServiceCategories.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Select Service</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the service category for this appointment
                </p>
              </div>
              <RadioGroup
                value={selectedServiceCategoryId || undefined}
                onValueChange={setSelectedServiceCategoryId}
                className="space-y-3"
              >
                {availableServiceCategories.map((service) => {
                  const isSelected = selectedServiceCategoryId === service.id;
                  return (
                    <div
                      key={service.id}
                      className={cn(
                        'flex items-start gap-3 p-4 border rounded-lg transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50',
                      )}
                      onClick={() => setSelectedServiceCategoryId(service.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedServiceCategoryId(service.id);
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
            </div>
          )}

          {/* Location Selection */}
          {selectedSlot && selectedServiceCategoryId && availableLocationTypes.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Choose Location</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Select where you'd like the appointment
                </p>
              </div>
              <RadioGroup
                value={locationType || undefined}
                onValueChange={(value) => {
                  setLocationType(value as 'HOME' | 'CLINIC');
                  if (value === LocationType.CLINIC) {
                    setClientAddress(''); // Clear address if switching to clinic
                  }
                }}
                className="space-y-3"
              >
                {availableLocationTypes.includes(LocationType.HOME) && (
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <RadioGroupItem value={LocationType.HOME} id="home" className="mt-1" />
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
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <RadioGroupItem value={LocationType.CLINIC} id="clinic" className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor="clinic"
                        className="font-medium cursor-pointer flex items-center gap-2"
                      >
                        <Building2 className="w-5 h-5" />
                        At Clinic
                      </Label>
                      {selectedSlot.location?.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {selectedSlot.location.address}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </RadioGroup>

              {/* Address Input for Home Visits */}
              {locationType === LocationType.HOME && (
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Your Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Required for home visit bookings. We'll use this address for the freelancer to
                    visit you.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Optional Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes for the appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellationReason" className="text-sm font-medium">
                Reason for Rescheduling (Optional)
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="Let us know why you're rescheduling..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRescheduling}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={!selectedSlotId || isRescheduling}>
            {isRescheduling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Rescheduling...
              </>
            ) : (
              'Confirm Reschedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
