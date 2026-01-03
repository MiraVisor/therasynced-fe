'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LocationType } from '@/types/enums';
import { Booking } from '@/types/types';

interface EnhancedBookingCardProps {
  booking: Booking;
  showActions?: boolean;
}

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-success/10 text-success border-success/20';
    case 'CANCELLED':
      return 'bg-error/10 text-error border-error/20';
    case 'CONFIRMED':
      return 'bg-info/10 text-info border-info/20';
    case 'RESCHEDULED':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'RESCHEDULED':
      return 'Rescheduled';
    default:
      return status;
  }
};

export const EnhancedBookingCard = ({ booking, showActions = true }: EnhancedBookingCardProps) => {
  const router = useRouter();
  const startTime = new Date(booking.slot.startTime);
  const endTime = new Date(booking.slot.endTime);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  const serviceName =
    booking.serviceCategories && booking.serviceCategories.length > 0
      ? booking.serviceCategories.map((sc) => sc.name).join(', ')
      : 'General Session';

  const clientInitials = booking.client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - User Info & Details */}
          <div className="flex-1 space-y-3">
            {/* User Header */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {booking.client.profilePicture ? (
                  <img
                    src={booking.client.profilePicture}
                    alt={booking.client.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {clientInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-base font-poppins font-semibold text-charcoal">
                  {booking.client.name}
                </h3>
                <p className="text-xs font-inter text-muted-foreground">{serviceName}</p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {formatStatus(booking.status)}
              </Badge>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-inter text-muted-foreground">
                  {format(startTime, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-inter text-muted-foreground">
                  {format(startTime, 'h:mm a')} ({durationMinutes} min)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-inter text-muted-foreground">
                  {formatLocation(booking.slot.locationType)}
                </p>
              </div>
              {booking.totalAmount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-inter font-semibold text-charcoal">
                    €{booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push(`/dashboard/appointments`);
                }}
                className="w-full sm:w-auto lg:w-full min-h-[44px]"
              >
                View Details
              </Button>
              {booking.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  onClick={() => {
                    router.push(`/dashboard/appointments`);
                  }}
                  className="w-full sm:w-auto lg:w-full min-h-[44px]"
                >
                  Start Session
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
