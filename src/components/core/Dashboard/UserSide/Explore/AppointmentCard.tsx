import { AvatarImage } from '@radix-ui/react-avatar';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const AppointmentCard: React.FC<{ date: Date | undefined; bookings?: any[] }> = ({
  date,
  bookings,
}) => {
  const router = useRouter();
  console.log('AppointmentCard bookings prop:', bookings);
  let booking: any = null;
  if (Array.isArray(bookings) && bookings.length > 0) {
    booking = bookings[0];
    console.log('First booking:', booking);
  }

  if (!Array.isArray(bookings)) {
    console.warn('bookings is not an array:', bookings);
    return null;
  }

  if (Array.isArray(bookings) && bookings.length === 0) {
    console.info('bookings is an empty array');
    return (
      <div className="dark:border-gray-700 rounded-xl p-2 bg-white dark:bg-gray-800 shadow-sm space-y-6 text-gray-400">
        No upcoming appointments found for this date.
      </div>
    );
  }

  if (!booking) {
    console.warn('No booking found in bookings:', bookings);
    return null;
  }

  const expert = booking.slot?.freelancer || {};
  const time = `${new Date(booking.slot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.slot?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const status = booking.status === 'CONFIRMED' ? 'confirmed' : 'pending';

  const handleReschedule = () => {
    if (booking?.slot?.freelancer?.id && booking?.id) {
      router.push(
        `/dashboard/doctors/${booking.slot.freelancer.id}?rescheduleBookingId=${booking.id}`,
      );
    }
  };

  return (
    <div className="relative dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm space-y-4">
      {/* Booking counter at top-right */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[16px]">
          <span className="font-semibold">Upcoming</span>{' '}
          <span className="text-green-500">Appointment</span>{' '}
          <span className="text-gray-500 mx-2">|</span>{' '}
          <span className="text-green-500">
            {Array.isArray(bookings) ? bookings.length : 0} Bookings
          </span>{' '}
          <span className="text-green-500 ml-1">→</span>
        </span>
      </div>

      {/* Expert info */}
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 rounded-full overflow-hidden">
          <AvatarImage
            src={
              expert.avatarUrl ||
              `https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&fit=crop&w=200&q=80`
            }
            className="w-full h-full object-cover"
          />
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{expert.name || 'Unknown Expert'}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{expert.specialty || 'N/A'}</p>
          <div className="flex gap-1 text-yellow-400 mt-1">
            {'★'.repeat(expert.rating || 0)}
            {'☆'.repeat(5 - (expert.rating || 0))}
          </div>
        </div>
      </div>
      <div className="space-y-3 py-4 border-y dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-lg">📅</span>
          <p className="text-sm font-medium">
            {new Date(booking.slot?.startTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-lg">⏰</span>
          {/* <p className="text-sm font-medium">{currentAppointment.time}</p> */}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {/* {currentAppointment.status} */}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleReschedule}
          className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reschedule
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
          onClick={() => {}}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
