'use client';

import { Calendar, Clock, ExternalLink, MapPin, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BookingDetailsModal } from '@/components/core/Dashboard/UserSide/MyBookings/BookingDetailsModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import type { Booking } from '@/types/booking';

interface NextAppointmentHeroProps {
  booking: Booking | null;
  loading?: boolean;
}

const NextAppointmentHero: React.FC<NextAppointmentHeroProps> = ({ booking, loading = false }) => {
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      <Card className="border border-gray-200">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-12 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return null; // Don't show anything if no booking
  }

  const getExpertName = (booking: Booking | null) => {
    return booking?.slot?.freelancer?.name || 'Unknown Freelancer';
  };

  const getBookingTime = (booking: Booking | null) => {
    if (!booking?.slot?.startTime) return '';
    return new Date(booking.slot.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getBookingDate = (booking: Booking | null) => {
    if (!booking?.slot?.startTime) return '';
    return new Date(booking.slot.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBookingLocation = (booking: Booking | null) => {
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

  const getLocationIcon = (booking: Booking | null) => {
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
    if (isToday) return 'border-blue-500 bg-blue-50 ';
    if (isTomorrow) return 'border-blue-300 bg-blue-50/50 ';
    return 'border-gray-200 ';
  };

  // Unused function removed - was: const _getUrgencyText = () => { ... };

  const LocationIcon = getLocationIcon(booking);
  const freelancerName = getExpertName(booking);

  return (
    <Card
      className={`border-2 ${getUrgencyColor()} transition-all duration-200 hover:shadow-lg relative overflow-hidden`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Section: Freelancer Photo and Basic Info */}
          <div className="flex items-start gap-4">
            {/* Freelancer Photo with improved styling */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-semibold text-xl border-2 border-primary/20">
                {freelancerName?.charAt(0).toUpperCase()}
              </div>
              {isToday && (
                <Badge className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-600 text-white border-2 border-white">
                  Today
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header with name and verification */}
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-poppins font-bold text-charcoal truncate">
                  {freelancerName}
                </h2>
                <VerificationBadge
                  status={
                    ((booking?.slot?.freelancer as { verificationStatus?: string })
                      ?.verificationStatus || 'unverified') as
                      | 'verified'
                      | 'pending'
                      | 'rejected'
                      | 'unverified'
                      | 'APPROVED'
                      | 'PENDING'
                      | 'REJECTED'
                      | 'UNVERIFIED'
                  }
                  size="sm"
                />
              </div>

              {/* Job title or specialty */}
              {(booking?.slot?.freelancer as unknown as { mainJobTitle?: { name: string } })
                ?.mainJobTitle && (
                <p className="text-sm font-inter text-gray-600 mb-3">
                  {
                    (booking.slot.freelancer as unknown as { mainJobTitle: { name: string } })
                      .mainJobTitle.name
                  }
                </p>
              )}
            </div>
          </div>

          {/* Middle Section: Appointment Details */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Date */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getBookingDate(booking)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getBookingTime(booking)}
                </p>
                {isWithin24Hours && timeUntil && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">
                    {timeUntil}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <LocationIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getBookingLocation(booking)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Price and Actions */}
          <div className="flex flex-col items-end justify-between gap-4 md:border-l md:pl-6 md:border-gray-200">
            {booking?.totalAmount && (
              <div className="text-center">
                <p className="text-xs font-inter text-gray-500 mb-1">
                  Total Amount
                </p>
                <div className="flex items-center gap-1 text-2xl font-poppins font-bold text-primary">
                  <span>EUR {booking.totalAmount}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowDetailsModal(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 text-base font-semibold w-full md:w-auto"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              {isWithin24Hours && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    // TODO: Implement join session logic
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Join Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        booking={booking}
      />
    </Card>
  );
};

export default NextAppointmentHero;
