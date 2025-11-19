'use client';

import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPatientBookingHistory } from '@/redux/api/bookingApi';

interface RecentBookingActivityProps {
  className?: string;
}

interface Booking {
  id: string;
  slot: {
    startTime: string;
    locationType: string;
    freelancer: {
      id: string;
      name: string;
    };
  };
  status: string;
  totalAmount: number;
}

const RecentBookingActivity = ({ className }: RecentBookingActivityProps) => {
  const router = useRouter();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      const hasData = recentBookings.length > 0;
      try {
        if (!hasData) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }
        const response = await getPatientBookingHistory({
          page: 1,
          limit: 5,
          sortBy: 'slot.startTime',
          sortOrder: 'desc',
        });

        if (response.success && Array.isArray(response.data)) {
          setRecentBookings(response.data.slice(0, 5));
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recent bookings';
        setError(errorMessage);
        // Don't clear data on error if we have existing data
        if (!hasData) {
          setRecentBookings([]);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchRecentBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show toast error only on initial load
  useEffect(() => {
    if (error && initialLoading) {
      toast.error(`Failed to load recent bookings: ${error}`);
    }
  }, [error, initialLoading]);

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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isLoading = initialLoading || (loading && recentBookings.length === 0);
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Recent Activity
          </CardTitle>
          <CardDescription className="font-inter">Your recent booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-12 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700/30 rounded ml-4 animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700/30 rounded w-full mt-4 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (recentBookings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Recent Activity
          </CardTitle>
          <CardDescription className="font-inter">Your recent booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm font-inter text-gray-500 dark:text-gray-400">
              No recent bookings
            </p>
            <p className="text-xs font-inter text-gray-400 dark:text-gray-500 mt-1">
              Your booking history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
          Recent Activity
        </CardTitle>
        <CardDescription className="font-inter">Your recent booking activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => {
            const LocationIcon = getLocationIcon(booking.slot.locationType);

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-poppins font-semibold text-gray-900 dark:text-white truncate">
                      {booking.slot.freelancer?.name || 'Unknown Therapist'}
                    </h3>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-inter text-gray-600 dark:text-gray-400">
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
                      <span className="text-sm font-poppins font-semibold text-gray-900 dark:text-white">
                        EUR {booking.totalAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => router.push('/dashboard/my-bookings')}
        >
          View All Bookings
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentBookingActivity;
