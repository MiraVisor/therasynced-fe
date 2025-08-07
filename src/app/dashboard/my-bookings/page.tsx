'use client';

import { Calendar, Clock, Filter, MapPin, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchBookings } from '@/redux/slices/bookingSlice';
import { RootState } from '@/redux/store';
import { Booking } from '@/types/types';

// Stats Section Component
const BookingStats = ({ bookings }: { bookings: Booking[] }) => {
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.slot.startTime) > new Date(),
  ).length;
  const completedBookings = bookings.filter((b) => new Date(b.slot.startTime) < new Date()).length;
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {upcomingBookings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedBookings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cancelledBookings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking }: { booking: Booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return new Date(booking.slot.startTime) > new Date()
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'RESCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'CONFIRMED') {
      return new Date(booking.slot.startTime) > new Date() ? 'Upcoming' : 'Completed';
    }
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getLocationText = () => {
    if (booking.slot.locationType === 'ONLINE') return 'Online';
    if (booking.slot.location) return booking.slot.location.name;
    return 'Office';
  };

  const isUpcoming =
    booking.status === 'CONFIRMED' && new Date(booking.slot.startTime) > new Date();

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {booking.slot.freelancer.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {booking.services.length > 0 ? booking.services[0].name : 'Therapy Session'}
            </p>
            <Badge className={`${getStatusColor(booking.status)} capitalize`}>
              {getStatusText(booking.status)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              €{booking.totalAmount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {booking.slot.duration} min
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(booking.slot.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{formatTime(booking.slot.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{getLocationText()}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          {isUpcoming && (
            <Button variant="outline" size="sm" className="flex-1">
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Filters Component
const BookingFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}) => {
  return (
    <Card className="border border-gray-200 dark:border-gray-700 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by expert name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchBookings({ includePast: true }) as any);
  }, [dispatch]);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.slot.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.services.length > 0 &&
        booking.services[0].name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = (() => {
      if (!statusFilter) return true;
      if (statusFilter === 'upcoming') {
        return booking.status === 'CONFIRMED' && new Date(booking.slot.startTime) > new Date();
      }
      if (statusFilter === 'completed') {
        return new Date(booking.slot.startTime) < new Date();
      }
      if (statusFilter === 'cancelled') {
        return booking.status === 'CANCELLED';
      }
      return true;
    })();

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all your therapy sessions
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Section */}
        <BookingStats bookings={bookings} />

        {/* Filters Section */}
        <BookingFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error loading bookings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchBookings({ includePast: true }) as any)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search or filter criteria'
                    : "You don't have any bookings yet"}
                </p>
                <Button variant="outline">Book New Session</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
