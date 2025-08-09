import { AvatarImage } from '@radix-ui/react-avatar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AppointmentCard: React.FC<{ date: Date | undefined; bookings?: any[] }> = ({
  bookings,
}) => {
  const router = useRouter();
  let booking: any = null;
  if (Array.isArray(bookings) && bookings.length > 0) {
    booking = bookings[0];
  }

  if (!Array.isArray(bookings)) {
    return null;
  }

  if (Array.isArray(bookings) && bookings.length === 0) {
    return (
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No appointments</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              No upcoming appointments found for this date.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return null;
  }

  const expert = booking.slot?.freelancer || {};

  const handleReschedule = () => {
    if (booking?.slot?.freelancer?.id && booking?.id) {
      router.push(
        `/dashboard/freelancer/${booking.slot.freelancer.id}?rescheduleBookingId=${booking.id}`,
      );
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Upcoming Appointment
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {Array.isArray(bookings) ? bookings.length : 0} Bookings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expert info */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={
                expert.avatarUrl ||
                `https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&fit=crop&w=200&q=80`
              }
              className="w-full h-full object-cover"
            />
            <AvatarFallback className="text-lg font-bold">
              {expert.name ? expert.name.charAt(0).toUpperCase() : 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                {expert.name || 'Unknown Expert'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {expert.specialty || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < (expert.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-500 ml-1">({expert.rating || 0})</span>
            </div>
          </div>
        </div>

        {/* Appointment details */}
        <div className="space-y-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-sm">📅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(booking.slot?.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-sm">⏰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {format(new Date(booking.slot?.startTime), 'HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <span className="text-sm">✓</span>
            </div>
            <Badge
              variant={status === 'confirmed' ? 'default' : 'secondary'}
              className={`text-xs ${
                status === 'confirmed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {status}
            </Badge>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleReschedule}
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => {}}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
