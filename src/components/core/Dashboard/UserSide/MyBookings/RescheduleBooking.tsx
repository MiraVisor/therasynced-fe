'use client';

import { addDays, format, isToday, isTomorrow, startOfDay } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Info,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { bookAppointment, fetchFreelancerSlots } from '@/redux/slices';
import { RootState } from '@/redux/store';

interface RescheduleBookingProps {
  bookingId: string;
  freelancerId: string;
  currentBooking: any;
  onCancel: () => void;
}

const RescheduleBooking: React.FC<RescheduleBookingProps> = ({
  freelancerId,
  currentBooking,
  onCancel,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { slots } = useSelector((state: RootState) => state.overview);

  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch available slots for the freelancer
  useEffect(() => {
    if (freelancerId && selectedDate) {
      dispatch(
        fetchFreelancerSlots({
          page: 1,
          limit: 50,
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: freelancerId,
        }) as any,
      );
    }
  }, [dispatch, freelancerId, selectedDate]);

  // Filter available slots for selected date
  useEffect(() => {
    if (slots && selectedDate) {
      const selectedDateStr = selectedDate.toDateString();
      const filteredSlots = slots.filter((slot: any) => {
        const slotDate = new Date(slot.startTime).toDateString();
        return (
          slotDate === selectedDateStr &&
          slot.status === 'AVAILABLE' &&
          slot.id !== currentBooking?.slot?.id // Exclude current slot
        );
      });
      setAvailableSlots(filteredSlots);
    }
  }, [slots, selectedDate, currentBooking]);

  const handleReschedule = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a new time slot');
      return;
    }

    setRescheduleLoading(true);
    try {
      const rescheduleData = {
        slotId: selectedTimeSlot,
        serviceIds: currentBooking.services?.map((s: any) => s.id) || [],
        notes: currentBooking.notes || '',
      };

      await dispatch(bookAppointment(rescheduleData) as any).unwrap();
      toast.success('Appointment rescheduled successfully!');
      router.push('/dashboard/my-bookings');
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to reschedule appointment');
      }
    } finally {
      setRescheduleLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let badgeProps = {
      variant: 'secondary' as 'default' | 'secondary',
      className: 'text-sm',
      label: status,
    };

    switch (status) {
      case 'CONFIRMED':
        badgeProps = {
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 text-sm',
          label: 'Confirmed',
        };
        break;
      case 'PENDING':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-sm',
          label: 'Pending',
        };
        break;
      default:
        badgeProps = {
          variant: 'secondary',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 text-sm',
          label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        };
    }

    return (
      <Badge variant={badgeProps.variant} className={badgeProps.className}>
        {badgeProps.label}
      </Badge>
    );
  };

  const selectedSlotData = availableSlots.find((slot) => slot.id === selectedTimeSlot);
  const freelancer = currentBooking?.slot?.freelancer;

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const getQuickDates = () => {
    const today = startOfDay(new Date());
    return [
      { date: today, label: 'Today' },
      { date: addDays(today, 1), label: 'Tomorrow' },
      { date: addDays(today, 2), label: format(addDays(today, 2), 'EEE, MMM d') },
      { date: addDays(today, 3), label: format(addDays(today, 3), 'EEE, MMM d') },
      { date: addDays(today, 7), label: format(addDays(today, 7), 'EEE, MMM d') },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Airbnb/Booking.com style */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h1>
                <p className="text-sm text-gray-500">Choose a new date and time</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Healthcare Professional Card - Airbnb style */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg font-bold">
                      {freelancer?.name?.charAt(0) || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {freelancer?.name || 'Unknown'}
                        </h2>
                        <p className="text-gray-600">
                          {freelancer?.specialty || 'Healthcare Professional'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                          <span className="text-sm text-gray-500">(127 reviews)</span>
                        </div>
                      </div>
                      {getStatusBadge(currentBooking?.status || 'PENDING')}
                    </div>

                    {/* Current Appointment Info */}
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <RotateCcw className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Current Appointment
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {currentBooking?.slot?.startTime
                              ? format(
                                  new Date(currentBooking.slot.startTime),
                                  'EEEE, MMMM d, yyyy',
                                )
                              : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {currentBooking?.slot?.startTime && currentBooking?.slot?.endTime
                              ? `${format(new Date(currentBooking.slot.startTime), 'HH:mm')} - ${format(new Date(currentBooking.slot.endTime), 'HH:mm')}`
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection - Airbnb style */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Select a new date</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Date Selection */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getQuickDates().map(({ date, label }) => (
                    <Button
                      key={date.toISOString()}
                      variant={
                        selectedDate?.toDateString() === date.toDateString() ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedDate(date)}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Calendar */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || date.getDay() === 0 || date.getDay() === 6;
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Selection - Airbnb style */}
            {selectedDate && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    Available times for {getDateDisplay(selectedDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`h-12 ${
                            selectedTimeSlot === slot.id
                              ? 'bg-blue-600 text-white border-0'
                              : 'border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                          }`}
                        >
                          {format(new Date(slot.startTime), 'HH:mm')}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No available slots</p>
                      <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected Time Summary */}
            {selectedSlotData && (
              <Card className="border-0 shadow-sm bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Selected time</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {format(new Date(selectedSlotData.startTime), 'EEEE, MMMM d')} at{' '}
                        {format(new Date(selectedSlotData.startTime), 'HH:mm')}
                      </p>
                    </div>
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Booking Summary Card - Airbnb style */}
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Services */}
                {currentBooking?.services && currentBooking.services.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Services</p>
                    {currentBooking.services.map((service: any, index: number) => (
                      <div key={service.id || index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          {service.duration && (
                            <p className="text-xs text-gray-500">{service.duration}</p>
                          )}
                        </div>
                        <p className="text-sm font-medium">€{service.price}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">€{currentBooking?.totalAmount || 0}</span>
                </div>

                {/* Reschedule Button */}
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedTimeSlot || rescheduleLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                >
                  {rescheduleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Reschedule
                    </>
                  )}
                </Button>

                {/* Info Note */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    Your original appointment will be automatically cancelled when you confirm the
                    new time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleBooking;
