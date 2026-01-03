'use client';

import { format, formatDistanceStrict } from 'date-fns';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFreelancerFutureBookings } from '@/hooks/queries/useBookings';
import { LocationType } from '@/types/enums';
import { Booking } from '@/types/types';

const formatLocation = (locationType: string): string => {
  switch (locationType) {
    case LocationType.CLINIC:
      return 'Clinic';
    case LocationType.HOME:
      return 'Home Visit';
    default:
      return 'Online Session';
  }
};

const formatCountdown = (startTime: Date): string => {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();

  if (diff < 0) {
    return 'Started';
  }

  if (diff < 60 * 1000) {
    return 'Starting now';
  }

  if (diff < 60 * 60 * 1000) {
    return `in ${Math.floor(diff / (60 * 1000))}m`;
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return `in ${Math.floor(diff / (60 * 60 * 1000))}h ${Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))}m`;
  }

  return formatDistanceStrict(now, startTime, { addSuffix: true });
};

export const NextAppointmentCard = () => {
  const { data: bookings = [], isLoading } = useFreelancerFutureBookings({
    sortBy: 'startTime',
    sortOrder: 'asc',
    limit: 10, // Get more to filter properly
  });

  const [countdown, setCountdown] = useState<string>('');

  // Filter to get the next appointment (excluding today's bookings and only confirmed/upcoming)
  const nextBooking: Booking | undefined = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    return bookings
      .filter((booking: Booking) => {
        const startTime = new Date(booking.slot.startTime);

        // Only show bookings that are:
        // 1. After today (not today, since those are shown in TodayAppointments)
        // 2. Confirmed or pending status
        const isAfterToday = startTime > today;
        const isValidStatus = booking.status === 'CONFIRMED' || booking.status === 'PENDING';

        return isAfterToday && isValidStatus;
      })
      .sort((a: Booking, b: Booking) => {
        return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
      })[0];
  }, [bookings]);

  useEffect(() => {
    if (!nextBooking) return;

    const startTime = new Date(nextBooking.slot.startTime);
    setCountdown(formatCountdown(startTime));

    // Update countdown every minute
    const interval = setInterval(() => {
      setCountdown(formatCountdown(startTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [nextBooking]);

  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2" />
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700/30 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700/20 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextBooking) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Next Up
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-poppins text-charcoal font-medium mb-1">No upcoming appointments</p>
            <p className="text-sm font-inter text-muted-foreground mb-4">
              Create availability slots to start accepting bookings.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/dashboard/availability';
              }}
            >
              Create Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const startTime = new Date(nextBooking.slot.startTime);
  const endTime = new Date(nextBooking.slot.endTime);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  const serviceName =
    nextBooking.serviceCategories && nextBooking.serviceCategories.length > 0
      ? nextBooking.serviceCategories.map((sc) => sc.name).join(', ')
      : 'General Session';

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Next Up
          </CardTitle>
          {countdown && (
            <span className="text-sm font-inter font-medium text-primary">{countdown}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-poppins font-semibold text-charcoal">
                {nextBooking.client.name}
              </h3>
              <p className="text-xs font-inter text-muted-foreground">{serviceName}</p>
            </div>
          </div>

          {/* Time & Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-inter text-muted-foreground">
                {format(startTime, 'EEEE, MMMM d, yyyy')} at {format(startTime, 'h:mm a')} (
                {durationMinutes} min)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-inter text-muted-foreground">
                {formatLocation(nextBooking.slot.locationType)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px]"
              onClick={() => {
                window.location.href = `/dashboard/appointments`;
              }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 min-h-[44px]"
              onClick={() => {
                window.location.href = `/dashboard/appointments`;
              }}
            >
              Open Calendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
