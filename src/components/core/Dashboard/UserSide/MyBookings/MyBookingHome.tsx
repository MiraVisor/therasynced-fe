'use client';

import { ArrowLeft, ArrowRight, Calendar, Check, Clock, CreditCard, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  bookAppointment,
  fetchFreelancerServices,
  fetchFreelancerSlots,
  fetchUserProfile,
} from '@/redux/slices';
import { RootState } from '@/redux/store';

import RescheduleBooking from './RescheduleBooking';

interface MyBookingHomeProps {
  rescheduleBookingId?: string | null;
}

// Define booking steps with icons
const BOOKING_STEPS = [
  { id: 1, title: 'Who', description: 'Who is this for?', icon: Users },
  { id: 2, title: 'When', description: 'Select date & time', icon: Calendar },
  { id: 3, title: 'Service', description: 'Choose service', icon: CreditCard },
  { id: 4, title: 'Review', description: 'Confirm booking', icon: Check },
];

const GREEN = 'bg-green-600 hover:bg-green-700 text-white';

const MyBookingHome: React.FC<MyBookingHomeProps> = ({ rescheduleBookingId }) => {
  const params = useParams();
  const router = useRouter();
  const doctorId = Array.isArray(params?.doctorId) ? params?.doctorId[0] : params?.doctorId;
  const dispatch = useDispatch();
  const { slots, userProfile, freelancerServices, servicesLoading } = useSelector(
    (state: RootState) => state.overview,
  );
  const { bookings } = useSelector((state: RootState) => state.booking);

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState({ start: '09:00', end: '17:00' });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [skipService, setSkipService] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Get current booking for reschedule
  const currentBooking = rescheduleBookingId
    ? bookings.find((booking: any) => booking.id === rescheduleBookingId)
    : null;

  // Debug logging
  if (rescheduleBookingId) {
    console.log('Reschedule Booking ID:', rescheduleBookingId);
    console.log('All bookings:', bookings);
    console.log('Current booking found:', currentBooking);
  }

  // Fetch user profile on component mount
  useEffect(() => {
    if (!userProfile) {
      setProfileLoading(true);
      dispatch(fetchUserProfile() as any).finally(() => setProfileLoading(false));
    }
  }, [dispatch, userProfile]);

  // Fetch freelancer services when doctorId is available
  useEffect(() => {
    if (doctorId) {
      dispatch(fetchFreelancerServices(doctorId) as any);
    }
  }, [dispatch, doctorId]);

  // Fetch freelancer slots when date changes
  useEffect(() => {
    if (doctorId && selectedDate) {
      dispatch(
        fetchFreelancerSlots({
          page: 1,
          limit: 50,
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: doctorId,
        }) as any,
      );
    }
  }, [dispatch, doctorId, selectedDate]);

  // Filter slots for selected date and time range
  useEffect(() => {
    if (slots && selectedDate) {
      const selectedDateStr = selectedDate.toDateString();
      const filteredSlots = slots.filter((slot: any) => {
        const slotDate = new Date(slot.startTime).toDateString();
        const slotTime = new Date(slot.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return (
          slotDate === selectedDateStr &&
          slot.status === 'AVAILABLE' &&
          slotTime >= timeRange.start &&
          slotTime <= timeRange.end
        );
      });
      setAvailableSlots(filteredSlots);
    }
  }, [slots, selectedDate, timeRange]);

  // Extract freelancer info from the first slot
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;
  const freelancer = firstSlot
    ? {
        id: firstSlot.freelancerId,
        name: firstSlot.freelancerName,
        specialty: firstSlot.specialty || 'Healthcare Professional',
        yearsOfExperience: 7,
        location: firstSlot.location?.name || 'Dublin, Ireland',
        rating: firstSlot.averageRating || 4.8,
        reviews: firstSlot.numberOfRatings || 127,
        address: firstSlot.location?.address || '123 Healthcare St, Dublin',
        hourlyRate: 120,
      }
    : null;

  // Calculate booking summary
  const selectedServiceData = freelancerServices?.find(
    (service: any) => service.id === selectedService,
  );
  const serviceFee = selectedServiceData?.price || 0;
  const bookingFee = 10; // Fixed booking fee
  const totalAmount = serviceFee + bookingFee;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      if (rescheduleBookingId) {
        toast.success('Appointment rescheduled successfully!');
        router.push('/dashboard/my-bookings');
      } else {
        const bookingData = {
          slotId: selectedTimeSlot,
          serviceIds: skipService ? [] : selectedService ? [selectedService] : [],
          notes: skipService ? 'No specific service requested' : '',
        };

        await dispatch(bookAppointment(bookingData) as any).unwrap();
        toast.success('Appointment booked successfully!');
        router.push('/dashboard/my-bookings');
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        err.message;
      } else {
        toast.error('Failed to book appointment');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelReschedule = () => {
    router.push('/dashboard/my-bookings');
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Always can proceed from user info
      case 2:
        return !!selectedDate && !!selectedTimeSlot;
      case 3:
        return skipService || !!selectedService || freelancerServices?.length === 0;
      default:
        return true;
    }
  };

  // Show reschedule flow if rescheduleBookingId is provided
  if (rescheduleBookingId && currentBooking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-bold">
                    {freelancer?.name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reschedule with {freelancer?.name || 'Healthcare Professional'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {freelancer?.specialty || 'Healthcare Professional'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <RescheduleBooking
            bookingId={rescheduleBookingId}
            freelancerId={doctorId || ''}
            currentBooking={currentBooking}
            onCancel={handleCancelReschedule}
          />
        </div>
      </div>
    );
  }

  // Show loading if rescheduleBookingId is provided but booking not found
  if (rescheduleBookingId && !currentBooking) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  // Stepper UI
  const renderStepper = () => (
    <div className="flex items-center justify-between mb-8">
      {BOOKING_STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex-1 flex flex-col items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                isActive
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : isCompleted
                    ? 'border-green-400 bg-green-100 text-green-600'
                    : 'border-gray-300 bg-white text-gray-400'
              } font-bold mb-1`}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span
              className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-gray-500'}`}
            >
              {step.title}
            </span>
            {idx < BOOKING_STEPS.length - 1 && (
              <div className="w-full h-0.5 bg-gray-200 mt-2 mb-2" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Who is this booking for?</h2>
            <p className="text-gray-600 mb-4">Let us know who will be attending the appointment.</p>
            {profileLoading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="bg-gray-200 h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 w-32 rounded" />
                  <div className="bg-gray-200 h-3 w-24 rounded" />
                </div>
              </div>
            ) : userProfile ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-full ring-2 ring-green-100">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white text-lg font-bold">
                    {userProfile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{userProfile.name || 'User'}</h3>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                  {userProfile.phone && (
                    <p className="text-sm text-gray-500">{userProfile.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Unable to load user profile</div>
            )}
            <div className="text-sm text-gray-400 mt-4">
              This booking will be made for you. You can modify your profile details in your account
              settings.
            </div>
          </section>
        );
      case 2:
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">When would you like to book?</h2>
            <p className="text-gray-600 mb-4">Select your preferred date and time.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" /> Select Date
                </h4>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border-0"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date.getDay() === 0 || date.getDay() === 6;
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" /> Preferred Time Range
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <input
                      type="time"
                      value={timeRange.start}
                      onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <input
                      type="time"
                      value={timeRange.end}
                      onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {selectedDate && (
                  <div>
                    <h5 className="font-medium mb-2">Available Slots</h5>
                    {availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.slice(0, 6).map((slot: any) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                            size="sm"
                            className={`text-xs ${selectedTimeSlot === slot.id ? GREEN : 'border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-600'}`}
                            onClick={() => setSelectedTimeSlot(slot.id)}
                          >
                            {new Date(slot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm py-2">
                        No available slots for this time range. Try adjusting the time range or
                        selecting a different date.
                      </div>
                    )}
                    {availableSlots.length > 6 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{availableSlots.length - 6} more slots available
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      case 3:
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">What service do you need?</h2>
            <p className="text-gray-600 mb-4">Choose a service or skip this step.</p>
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="skip-service"
                checked={skipService}
                onChange={(e) => {
                  setSkipService(e.target.checked);
                  if (e.target.checked) setSelectedService('');
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="skip-service" className="text-base font-medium cursor-pointer flex-1">
                I don&apos;t need a specific service
              </Label>
            </div>
            {!skipService && (
              <div>
                <h4 className="font-semibold mb-2">Select a Service</h4>
                {servicesLoading ? (
                  <div className="space-y-2">
                    <div className="animate-pulse bg-gray-200 h-10 rounded" />
                    <div className="animate-pulse bg-gray-200 h-10 rounded" />
                  </div>
                ) : freelancerServices && freelancerServices.length > 0 ? (
                  <Combobox
                    options={freelancerServices.map((service: any) => ({
                      value: service.id,
                      label: `${service.name} - €${service.price} (${service.duration || '60 min'})`,
                    }))}
                    value={selectedService}
                    onValueChange={setSelectedService}
                    placeholder="Search and select a service..."
                    searchPlaceholder="Search services..."
                    emptyMessage="No services found."
                  />
                ) : (
                  <div className="text-gray-500 text-sm">
                    No services available for this freelancer.
                  </div>
                )}
              </div>
            )}
          </section>
        );
      case 4:
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Review your booking</h2>
            <p className="text-gray-600 mb-4">Please confirm your booking details.</p>
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-bold">
                    {freelancer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{freelancer.name}</h3>
                  <p className="text-gray-600">{freelancer.specialty}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Booking for: </span>
                  <span className="font-medium">{userProfile?.name || 'User'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date: </span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time: </span>
                  <span className="font-medium">
                    {selectedTimeSlot &&
                    availableSlots.find((slot) => slot.id === selectedTimeSlot)?.startTime
                      ? new Date(
                          availableSlots.find((slot) => slot.id === selectedTimeSlot)?.startTime,
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Not selected'}
                  </span>
                </div>
                {!skipService && selectedServiceData && (
                  <div>
                    <span className="text-gray-500">Service: </span>
                    <span className="font-medium">{selectedServiceData.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              {!skipService && selectedServiceData && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service Fee</span>
                  <span>€{serviceFee}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Booking Fee</span>
                <span>€{bookingFee}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2">
                <span>Total</span>
                <span className="text-green-600">€{totalAmount}</span>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-lg lg:max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 mx-auto flex flex-col px-2 sm:px-6 lg:px-12 py-6">
        {/* Stepper */}
        {renderStepper()}
        {/* Step Content */}
        {renderStepContent()}
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 w-full sm:w-32"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className={`flex items-center gap-2 w-full sm:w-32 ${GREEN}`}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleBookAppointment}
              disabled={!canProceedToNext() || bookingLoading}
              className={`flex items-center gap-2 w-full sm:w-48 justify-center ${GREEN}`}
            >
              {bookingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {rescheduleBookingId ? 'Rescheduling...' : 'Booking...'}
                </>
              ) : (
                <>
                  {rescheduleBookingId ? 'Reschedule' : 'Confirm Booking'}
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingHome;
