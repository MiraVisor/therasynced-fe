'use client';

import { ChevronLeft, ChevronRight, Divide, Moon, Star, Sun } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { rescheduleBooking } from '@/redux/api/exploreApi';
import { bookAppointment, fetchFreelancerSlots } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: Date;
  label: string;
  morningSlots: TimeSlot[];
  eveningSlots: TimeSlot[];
  totalAvailable: number;
}

// const therapist = {
//   id: '1',
//   name: 'Dr Lee Marshell',
//   profession: 'Message therapy',
//   yearsOfExperience: 7,
//   location: 'Ireland',
//   rating: 4.8,
//   reviews: 1437,
//   avatar: '/path/to/avatar.jpg',
// };

interface MyBookingHomeProps {
  rescheduleBookingId?: string | null;
}

const MyBookingHome: React.FC<MyBookingHomeProps> = ({ rescheduleBookingId }) => {
  const params = useParams();
  // Fix: params.doctorId may be string or array, handle both
  const doctorId = Array.isArray(params?.doctorId) ? params.doctorId[0] : params?.doctorId;
  const dispatch = useDispatch();
  const { slots, slotsPagination } = useSelector((state: RootState) => state.overview);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (doctorId) {
      dispatch(
        fetchFreelancerSlots({
          page: 1,
          limit: 10,
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: doctorId,
        }) as any,
      );
    }
  }, [dispatch, doctorId]);

  // Extract freelancer info from the first slot (if available)
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;
  const therapist = firstSlot
    ? {
        id: firstSlot.freelancerId,
        name: firstSlot.freelancerName,
        profession: '', // If you have a profession field, map it here
        yearsOfExperience: 7, // Static value for now
        location: firstSlot.location?.name || '',
        rating: firstSlot.averageRating || 0,
        reviews: firstSlot.numberOfRatings || 0,
        avatar: firstSlot.profilePicture || '',
        address: firstSlot.location?.address || '',
      }
    : null;

  // Group slots by date for UI
  const slotsByDate: { [date: string]: any[] } = {};
  slots?.forEach((slot: any) => {
    const date = new Date(slot.startTime).toDateString();
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });
  // Sort slotDates chronologically (oldest first)
  const slotDates = Object.keys(slotsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const todayStr = new Date().toDateString();
  const slotDateLabels = slotDates.map((date) => (date === todayStr ? 'Today' : date));
  const selectedDate = slotDates[selectedDayIndex] || slotDates[0];
  const selectedDaySlots = slotsByDate[selectedDate] || [];

  // Split into morning/evening
  const morningSlots = selectedDaySlots.filter((slot: any) => {
    const hour = new Date(slot.startTime).getHours();
    return hour >= 9 && hour < 17; // 9am to before 5pm
  });
  const eveningSlots = selectedDaySlots.filter((slot: any) => {
    const hour = new Date(slot.startTime).getHours();
    return hour >= 17; // 5pm and later
  });

  return (
    <div className="flex flex-col">
      {/* Therapist Profile Section */}
      <div className="flex mb-9 gap-2">
        <div className="flex flex-col items-center justify-center h-full">
          <Avatar className="h-[144px] w-[139px] mr-4">
            <AvatarImage src={therapist?.avatar || undefined} />
            <AvatarFallback className="bg-green-700 text-white text-xl">
              {therapist?.name
                ? therapist.name
                    .split(' ')
                    .map((n: any) => n[0])
                    .join('')
                : ''}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" className="p-0 hover:bg-transparent">
            View Profile
          </Button>
        </div>
        <div className="flex flex-col justify-between gap-3.5 mt-3 mb-2">
          <div className="flex flex-col justify-center gap-2.5">
            <div className="font-inter font-semibold text-base16">{therapist?.name || '-'}</div>
            {/* Profession and years of experience if available */}
            {therapist?.profession && (
              <div className="font-inter font-medium text-base14 text-[#525252]">
                {therapist.profession}
              </div>
            )}
            {therapist?.yearsOfExperience && (
              <div className="font-inter font-medium text-base14  text-[#525252]">
                {therapist.yearsOfExperience}+ Years of Experience
              </div>
            )}
            <div className="font-inter font-medium text-base14  text-[#525252]">
              {therapist?.location || '-'}
            </div>
            {therapist?.address && (
              <div className="font-inter font-medium text-base14  text-[#525252]">
                {therapist.address}
              </div>
            )}
          </div>
          <div className="flex items-center border-t pt-2 mt-2 border-[#939393]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${therapist && therapist.rating && i < Math.round(therapist.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
              />
            ))}
            <span className="ml-2">{therapist?.reviews || 0} Patient Stories</span>
          </div>
        </div>
      </div>

      {/* Day Selection Tabs */}
      <div className="flex items-center mb-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDayIndex(Math.max(selectedDayIndex - 1, 0))}
          disabled={selectedDayIndex === 0}
          className="rounded-full h-10 w-10 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-between px-4">
          {slotDates.map((date, index) => (
            <div
              key={date}
              className={`cursor-pointer text-center flex-1 ${selectedDayIndex === index ? 'border-b-2 border-green-500 pb-2' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
            >
              <h3 className="font-medium mb-1">{slotDateLabels[index]}</h3>
              <p className="text-sm text-gray-500">
                {slotsByDate[date].length} {slotsByDate[date].length === 1 ? 'slot' : 'slots'}{' '}
                Available
              </p>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDayIndex(Math.min(selectedDayIndex + 1, slotDates.length - 1))}
          disabled={selectedDayIndex === slotDates.length - 1}
          className="rounded-full h-10 w-10 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Slots Section */}
      {selectedDaySlots.length > 0 && (
        <>
          {/* Morning Slots */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Sun className="mr-2 h-5 w-5" />
              <h3 className="font-medium">Morning</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {morningSlots.map((slot: any, index: number) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                  className={`h-11 text-sm font-medium ${
                    selectedTimeSlot === slot.id
                      ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                      : 'border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-600'
                  } ${slot.status === 'AVAILABLE' ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={slot.status !== 'AVAILABLE'}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                >
                  {new Date(slot.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
              ))}
            </div>
          </div>
          {/* Evening Slots */}
          <div>
            <div className="flex items-center mb-2">
              <Moon className="mr-2 h-5 w-5" />
              <h3 className="font-medium">Evening</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {eveningSlots.map((slot: any, index: number) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                  className={`text-sm ${slot.status === 'AVAILABLE' ? '' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={slot.status !== 'AVAILABLE'}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                >
                  {new Date(slot.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="mt-12">
        <Button
          className="w-full"
          disabled={!selectedTimeSlot || bookingLoading}
          onClick={async () => {
            if (!selectedTimeSlot) return;
            setBookingLoading(true);
            try {
              if (rescheduleBookingId) {
                // Reschedule flow
                const result = await rescheduleBooking(rescheduleBookingId, selectedTimeSlot);
                toast.success('Appointment rescheduled successfully!');
                // Optionally, redirect or update UI here
              } else {
                // Normal booking flow
                const result = await dispatch(
                  bookAppointment({ slotId: selectedTimeSlot }) as any,
                ).unwrap();
                toast.success('Appointment booked successfully!');
              }
            } catch (err: any) {
              // Handle reschedule errors
              if (err?.response?.data?.message) {
                toast.error(err.response.data.message);
              } else if (err?.message) {
                toast.error(err.message);
              } else {
                toast.error('Failed to book or reschedule appointment');
              }
            } finally {
              setBookingLoading(false);
            }
          }}
        >
          {bookingLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              {rescheduleBookingId ? 'Rescheduling...' : 'Booking...'}
            </span>
          ) : rescheduleBookingId ? (
            'Reschedule Appointment'
          ) : (
            'Book Appointment'
          )}
        </Button>
      </div>
    </div>
  );
};

export default MyBookingHome;
