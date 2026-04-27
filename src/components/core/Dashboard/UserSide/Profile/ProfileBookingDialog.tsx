'use client';

import { format } from 'date-fns';
import {
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBooking } from '@/hooks/queries/useBookings';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { Expert, Slot } from '@/types/types';

interface ProfileBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert;
  preselectedSlotId?: string | null;
}

type BookingStep = 'date' | 'time' | 'services' | 'details' | 'confirm';

const STEPS: BookingStep[] = ['date', 'time', 'services', 'details', 'confirm'];

export function ProfileBookingDialog({
  isOpen,
  onClose,
  expert,
  preselectedSlotId,
}: ProfileBookingDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<'HOME' | 'CLINIC' | null>(null);
  const [clientAddress, setClientAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch available slots
  const { data: slots = [], isLoading: isLoadingSlots } = useAvailableSlots(expert.id, {});
  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    const now = new Date();

    slots
      .filter((slot) => slot.status === 'AVAILABLE' && new Date(slot.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .forEach((slot) => {
        const dateKey = format(new Date(slot.startTime), 'yyyy-MM-dd');
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(slot);
      });

    return grouped;
  }, [slots]);

  const availableDates = Array.from(slotsByDate.keys());
  const slotsForSelectedDate = selectedDate ? slotsByDate.get(selectedDate) || [] : [];

  // Group time slots by period
  const groupedTimeSlots = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    slotsForSelectedDate.forEach((slot) => {
      const hour = new Date(slot.startTime).getHours();
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [slotsForSelectedDate]);

  // Check if services are available
  const hasServices = expert.serviceCategoryPricing && expert.serviceCategoryPricing.length > 0;

  // Check available locations for selected slot
  const availableLocations = useMemo(() => {
    if (!selectedSlot) return [];
    const locations: ('HOME' | 'CLINIC')[] = [];

    // Check if the slot supports different locations
    if (selectedSlot.locationType === 'HOME' || selectedSlot.locationType === 'CLINIC') {
      locations.push(selectedSlot.locationType as 'HOME' | 'CLINIC');
    } else {
      // Default to both if not specified
      locations.push('CLINIC', 'HOME');
    }

    return locations;
  }, [selectedSlot]);

  // Auto-select preselected slot
  useEffect(() => {
    if (preselectedSlotId && slots.length > 0) {
      const slot = slots.find((s) => s.id === preselectedSlotId);
      if (slot) {
        const dateKey = format(new Date(slot.startTime), 'yyyy-MM-dd');
        setSelectedDate(dateKey);
        setSelectedSlot(slot);
        setStep('services');
      }
    }
  }, [preselectedSlotId, slots]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = selectedSlot?.basePrice || 0;

    if (selectedServices.length > 0 && expert.serviceCategoryPricing) {
      selectedServices.forEach((serviceId) => {
        const service = expert.serviceCategoryPricing?.find((s) => s.serviceId === serviceId);
        if (service) {
          // Find location-specific price if available
          const locationPrice = service.locations?.find((l) => l.locationType === selectedLocation);
          if (locationPrice) {
            price += locationPrice.price;
          } else {
            price += service.price || 0;
          }
        }
      });
    }

    return price;
  }, [selectedSlot, selectedServices, selectedLocation, expert.serviceCategoryPricing]);

  // Handle step navigation
  const currentStepIndex = STEPS.indexOf(step);

  const goToNextStep = () => {
    if (step === 'date' && selectedDate) {
      setStep('time');
    } else if (step === 'time' && selectedSlot) {
      setStep(hasServices ? 'services' : 'details');
    } else if (step === 'services') {
      setStep('details');
    } else if (step === 'details') {
      setStep('confirm');
    }
  };

  const goToPrevStep = () => {
    if (step === 'time') {
      setStep('date');
    } else if (step === 'services') {
      setStep('time');
    } else if (step === 'details') {
      setStep(hasServices ? 'services' : 'time');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!selectedSlot) return;

    createBooking(
      {
        slotId: selectedSlot.id,
        serviceCategoryIds: selectedServices.length > 0 ? selectedServices : undefined,
        locationType: selectedLocation || undefined,
        clientAddress: selectedLocation === 'HOME' ? clientAddress : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('🎉 Booking confirmed successfully!');
          handleClose();
          router.push('/dashboard/my-bookings');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to create booking');
        },
      },
    );
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setStep('date');
    setSelectedSlot(null);
    setSelectedDate(null);
    setSelectedServices([]);
    setSelectedLocation(null);
    setClientAddress('');
    setNotes('');
    onClose();
  };

  // Format date for display
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    }
    return format(date, 'EEE');
  };

  const renderTimeSlotGroup = (title: string, slotsList: Slot[], icon: React.ReactNode) => {
    if (slotsList.length === 0) return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slotsList.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="font-medium text-sm">
                  {format(new Date(slot.startTime), 'h:mm a')}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-mint/5">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={expert.profilePicture || undefined} alt={expert.name} />
              <AvatarFallback className="bg-primary text-white font-poppins font-bold">
                {expert.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                Book with {expert.name}
              </h2>
              {expert.jobTitle?.name && (
                <p className="text-sm font-inter text-gray-500">{expert.jobTitle.name}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            {STEPS.filter((s) => hasServices || s !== 'services').map((s, i, arr) => {
              const stepIndex = STEPS.indexOf(s);
              const isActive = step === s;
              const isCompleted = currentStepIndex > stepIndex;
              const stepLabels: Record<BookingStep, string> = {
                date: 'Date',
                time: 'Time',
                services: 'Services',
                details: 'Details',
                confirm: 'Confirm',
              };

              return (
                <div key={s} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}
                    >
                      {stepLabels[s]}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 mx-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[300px]">
          {/* Date Selection Step */}
          {step === 'date' && (
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg">Select a Date</h3>

              {isLoadingSlots ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-inter">No available slots at this time</p>
                  <p className="text-sm text-gray-400 mt-1">Please check back later</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.slice(0, 14).map((date) => {
                    const d = new Date(date);
                    const isSelected = selectedDate === date;
                    const slotsCount = slotsByDate.get(date)?.length || 0;

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <div
                          className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
                        >
                          {formatDateLabel(date)}
                        </div>
                        <div className="text-lg font-bold">{format(d, 'd')}</div>
                        <div
                          className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
                        >
                          {format(d, 'MMM')}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`mt-1 text-[10px] px-1.5 py-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {slotsCount} slot{slotsCount !== 1 ? 's' : ''}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Time Selection Step */}
          {step === 'time' && selectedDate && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-semibold text-lg">Select a Time</h3>
                <Badge variant="outline" className="text-primary border-primary">
                  {format(new Date(selectedDate), 'EEE, MMM d')}
                </Badge>
              </div>

              <div className="space-y-6">
                {renderTimeSlotGroup(
                  'Morning',
                  groupedTimeSlots.morning,
                  <span className="text-yellow-500">🌅</span>,
                )}
                {renderTimeSlotGroup(
                  'Afternoon',
                  groupedTimeSlots.afternoon,
                  <span className="text-orange-500">☀️</span>,
                )}
                {renderTimeSlotGroup(
                  'Evening',
                  groupedTimeSlots.evening,
                  <span className="text-purple-500">🌙</span>,
                )}
              </div>

              {selectedSlot && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(selectedSlot.startTime), 'h:mm a')} -{' '}
                            {format(new Date(selectedSlot.endTime), 'h:mm a')}
                          </p>
                          <p className="text-sm text-gray-500">{selectedSlot.duration} minutes</p>
                        </div>
                      </div>
                      <div className="text-lg font-poppins font-bold text-primary">
                        €{selectedSlot.basePrice}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Services Selection Step */}
          {step === 'services' && hasServices && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-semibold text-lg">Select Services</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the services you need (optional)
                </p>
              </div>

              <div className="space-y-2">
                {expert.serviceCategoryPricing?.map((service) => {
                  const isSelected = selectedServices.includes(service.serviceId);
                  return (
                    <button
                      key={service.serviceId}
                      onClick={() => {
                        setSelectedServices((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== service.serviceId)
                            : [...prev, service.serviceId],
                        );
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="font-medium">{service.serviceName}</span>
                      </div>
                      <span className="text-primary font-poppins font-semibold">
                        +€{service.price?.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-6">
              <h3 className="font-poppins font-semibold text-lg">Booking Details</h3>

              {/* Location Selection */}
              {availableLocations.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLocation('CLINIC')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedLocation === 'CLINIC'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <Building2
                        className={`h-6 w-6 mb-2 ${selectedLocation === 'CLINIC' ? 'text-primary' : 'text-gray-400'}`}
                      />
                      <div className="font-medium">At Clinic</div>
                      <div className="text-xs text-gray-500">
                        Visit the freelancer&apos;s location
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedLocation('HOME')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedLocation === 'HOME'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 mb-2 ${selectedLocation === 'HOME' ? 'text-primary' : 'text-gray-400'}`}
                      />
                      <div className="font-medium">Home Visit</div>
                      <div className="text-xs text-gray-500">Freelancer comes to you</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Address for Home Visit */}
              {selectedLocation === 'HOME' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Your Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address..."
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or information for the freelancer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirm' && selectedSlot && (
            <div className="space-y-6">
              <h3 className="font-poppins font-semibold text-lg">Confirm Your Booking</h3>

              <Card className="overflow-hidden">
                <div className="bg-primary/10 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={expert.profilePicture || undefined} alt={expert.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {expert.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-poppins font-semibold">{expert.name}</p>
                      <p className="text-sm text-gray-500">{expert.jobTitle?.name}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>{format(new Date(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span>
                      {format(new Date(selectedSlot.startTime), 'h:mm a')} -{' '}
                      {format(new Date(selectedSlot.endTime), 'h:mm a')} ({selectedSlot.duration}{' '}
                      min)
                    </span>
                  </div>
                  {selectedLocation && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>
                        {selectedLocation === 'HOME' ? 'Home Visit' : 'At Clinic'}
                        {clientAddress && ` - ${clientAddress}`}
                      </span>
                    </div>
                  )}
                  {selectedServices.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500 mb-2">Selected Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((serviceId) => {
                          const service = expert.serviceCategoryPricing?.find(
                            (s) => s.serviceId === serviceId,
                          );
                          return (
                            <Badge key={serviceId} variant="secondary">
                              {service?.serviceName}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-semibold text-lg">Total</span>
                    <span className="text-2xl font-poppins font-bold text-primary">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            {step !== 'date' && (
              <Button variant="outline" onClick={goToPrevStep} className="flex-shrink-0">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex-1" />

            {step === 'date' && (
              <Button
                onClick={goToNextStep}
                disabled={!selectedDate}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'time' && (
              <Button
                onClick={goToNextStep}
                disabled={!selectedSlot}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'services' && (
              <Button onClick={goToNextStep} className="bg-primary text-white hover:bg-primary/90">
                {selectedServices.length > 0 ? 'Continue' : 'Skip'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'details' && (
              <Button onClick={goToNextStep} className="bg-primary text-white hover:bg-primary/90">
                Review Booking
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'confirm' && (
              <Button
                onClick={handleConfirmBooking}
                disabled={isCreating}
                className="bg-primary text-white hover:bg-primary/90 min-w-[140px]"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Confirm Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileBookingDialog;
