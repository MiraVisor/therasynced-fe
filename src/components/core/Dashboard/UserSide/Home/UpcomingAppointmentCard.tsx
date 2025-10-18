'use client';

import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerifiedAvatar } from '@/components/ui/verification-badge';

interface UpcomingAppointmentCardProps {
  booking: any;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ booking }) => {
  const router = useRouter();

  const getExpertName = (booking: any) => {
    return booking?.slot?.freelancer?.name || booking?.expertName || 'Unknown Therapist';
  };

  const getBookingTime = (booking: any) => {
    if (!booking?.slot?.startTime) return '';
    return new Date(booking.slot.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getBookingDate = (booking: any) => {
    if (!booking?.slot?.startTime) return '';
    const date = new Date(booking.slot.startTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getBookingLocation = (booking: any) => {
    const locationType = booking?.slot?.locationType;
    switch (locationType) {
      case 'OFFICE':
        return 'Office';
      case 'VIRTUAL':
        return 'Online';
      case 'HOME':
        return 'Home Visit';
      default:
        return 'Virtual';
    }
  };

  const getLocationIcon = (booking: any) => {
    const locationType = booking?.slot?.locationType;
    return locationType === 'VIRTUAL' ? Video : MapPin;
  };

  const getDateBadgeColor = (booking: any) => {
    const bookingDate = new Date(booking?.slot?.startTime);
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();
    const isTomorrow =
      bookingDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    if (isToday) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (isTomorrow) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const LocationIcon = getLocationIcon(booking);

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Date Badge */}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDateBadgeColor(booking)}`}
          >
            {getBookingDate(booking)}
          </div>

          {/* Therapist Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <VerifiedAvatar
              name={getExpertName(booking)}
              verificationStatus={booking?.slot?.freelancer?.verificationStatus}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {getExpertName(booking)}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getBookingTime(booking)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <LocationIcon className="w-4 h-4" />
                  <span>{getBookingLocation(booking)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">
                €{booking?.totalAmount || '0'}
              </div>
            </div>
            <Button
              onClick={() => router.push(`/dashboard/my-bookings/${booking.id}`)}
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointmentCard;
