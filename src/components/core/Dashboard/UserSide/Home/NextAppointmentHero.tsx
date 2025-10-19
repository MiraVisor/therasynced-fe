'use client';

import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface NextAppointmentHeroProps {
  booking: any;
  loading?: boolean;
}

const NextAppointmentHero: React.FC<NextAppointmentHeroProps> = ({ booking, loading = false }) => {
  const router = useRouter();
  const [timeUntil, setTimeUntil] = useState<string>('');

  useEffect(() => {
    if (!booking?.slot?.startTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const appointmentTime = new Date(booking.slot.startTime);
      const diff = appointmentTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntil('Session started');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeUntil(`${days} day${days > 1 ? 's' : ''} away`);
      } else if (hours > 0) {
        setTimeUntil(`${hours}h ${minutes}m away`);
      } else {
        setTimeUntil(`${minutes}m away`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [booking]);

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return null; // Don't show anything if no booking
  }

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
    return new Date(booking.slot.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
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

  const bookingDate = new Date(booking.slot?.startTime);
  const now = new Date();
  const isToday = bookingDate.toDateString() === now.toDateString();
  const isTomorrow =
    bookingDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const isWithin24Hours = bookingDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;

  const getUrgencyColor = () => {
    if (isToday) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
    if (isTomorrow) return 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/5';
    return 'border-gray-200 dark:border-gray-700';
  };

  const getUrgencyText = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return bookingDate.toLocaleDateString('en', { weekday: 'short' });
  };

  const LocationIcon = getLocationIcon(booking);

  return (
    <Card className={`border-2 ${getUrgencyColor()} transition-all duration-200 hover:shadow-lg`}>
      <CardContent className="p-8">
        <div className="flex items-center gap-6">
          {/* Therapist Photo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-2xl flex-shrink-0">
              {getExpertName(booking)?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getExpertName(booking)}
                  </h2>
                  <VerificationBadge
                    status={booking?.slot?.freelancer?.verificationStatus}
                    size="md"
                  />
                </div>

                <div className="flex items-center gap-6 text-lg text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{getBookingDate(booking)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{getBookingTime(booking)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LocationIcon className="w-5 h-5" />
                    <span>{getBookingLocation(booking)}</span>
                  </div>
                </div>

                {isWithin24Hours && timeUntil && (
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                    <span>{timeUntil}</span>
                  </div>
                )}

                {booking?.totalAmount && (
                  <div className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                    €{booking.totalAmount}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={() => {
                    console.log('Join session:', booking);
                    // TODO: Implement join session logic
                  }}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
                >
                  Join Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextAppointmentHero;
