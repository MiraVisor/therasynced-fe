'use client';

import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { BookingDetailsModal } from '@/components/core/Dashboard/UserSide/MyBookings/BookingDetailsModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatientBookingHistory } from '@/hooks/queries';
import { Booking } from '@/types/types';

const YourSessions = () => {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: bookingsData = [], isLoading: loading } = usePatientBookingHistory({
    page: 1,
    limit: 20,
    sortBy: 'slot.startTime',
    sortOrder: 'desc',
  });

  const { upcoming: upcomingSessions, past: pastSessions } = useMemo(() => {
    const now = new Date();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    bookingsData.forEach((booking: Booking) => {
      const bookingDate = new Date(booking.slot.startTime);
      const isUpcoming = booking.status === 'CONFIRMED' && bookingDate > now;

      if (isUpcoming) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    // Sort upcoming by date ascending (soonest first)
    upcoming.sort(
      (a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime(),
    );

    // Sort past by date descending (most recent first)
    past.sort(
      (a, b) => new Date(b.slot.startTime).getTime() - new Date(a.slot.startTime).getTime(),
    );

    return {
      upcoming: upcoming.slice(0, 5), // Show top 5 upcoming
      past: past.slice(0, 5), // Show top 5 past
    };
  }, [bookingsData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getLocationIcon = (locationType: string) => {
    return locationType === 'VIRTUAL' ? Video : MapPin;
  };

  const getLocationText = (locationType: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  if (loading && bookingsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Your Sessions
          </CardTitle>
          <CardDescription className="font-inter">Upcoming and past appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse"
              >
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allSessions = [...upcomingSessions, ...pastSessions];

  if (allSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Your Sessions
          </CardTitle>
          <CardDescription className="font-inter">Upcoming and past appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm font-inter text-gray-500 sessions yet</p>">
            <p className="text-xs font-inter text-gray-400 mt-1">
              Your booking history will appear here
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard/book')}
            >
              Book Your First Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Your Sessions
            </CardTitle>
            <CardDescription className="font-inter">Upcoming and past appointments</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/my-bookings')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">
                Upcoming ({upcomingSessions.length})
              </h3>
              <div className="space-y-3">
                {upcomingSessions.map((booking: Booking) => {
                  const LocationIcon = getLocationIcon(booking.slot.locationType);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-poppins font-semibold text-gray-900 truncate">
                            {booking.slot.freelancer?.name || 'Unknown Freelancer'}
                          </h4>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-inter text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.slot.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(booking.slot.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <LocationIcon className="w-4 h-4" />
                            <span>{getLocationText(booking.slot.locationType)}</span>
                          </div>
                        </div>
                        {booking.totalAmount && (
                          <div className="mt-2">
                            <span className="text-sm font-poppins font-semibold text-gray-900">
                              EUR {booking.totalAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">
                Past Sessions ({pastSessions.length})
              </h3>
              <div className="space-y-3">
                {pastSessions.map((booking: Booking) => {
                  const LocationIcon = getLocationIcon(booking.slot.locationType);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer opacity-75"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-poppins font-semibold text-gray-900 truncate">
                            {booking.slot.freelancer?.name || 'Unknown Freelancer'}
                          </h4>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-inter text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.slot.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(booking.slot.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <LocationIcon className="w-4 h-4" />
                            <span>{getLocationText(booking.slot.locationType)}</span>
                          </div>
                        </div>
                        {booking.totalAmount && (
                          <div className="mt-2">
                            <span className="text-sm font-poppins font-semibold text-gray-900">
                              EUR {booking.totalAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        booking={selectedBooking}
      />
    </Card>
  );
};

export default YourSessions;
