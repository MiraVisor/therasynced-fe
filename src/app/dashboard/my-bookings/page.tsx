'use client';

import {
  Calendar,
  Clock,
  Filter,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cancelUserBooking, fetchUserBookings } from '@/redux/slices/bookingSlice';
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
const BookingCard = ({
  booking,
  onMessage,
  onReschedule,
  onCancel,
  cancellingBookingId,
}: {
  booking: Booking;
  onMessage: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  cancellingBookingId: string | null;
}) => {
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
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {booking.slot.freelancer.name}
              </h3>
              <Badge className={`${getStatusColor(booking.status)} text-xs font-medium px-2 py-1`}>
                {getStatusText(booking.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {booking.services.length > 0 ? booking.services[0].name : 'Therapy Session'}
            </p>
          </div>
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              €{booking.totalAmount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {booking.slot.duration} minutes
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(booking.slot.startTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Time</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatTime(booking.slot.startTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {getLocationText()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onMessage(booking)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          {isUpcoming && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 text-sm font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => onReschedule(booking)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                onClick={() => onCancel(booking)}
                disabled={cancellingBookingId === booking.id}
              >
                {cancellingBookingId === booking.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                )}
              </Button>
            </>
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
              <SelectItem value="all">All Status</SelectItem>
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
  const router = useRouter();
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchUserBookings({ date: new Date().toISOString() }) as any);
  }, [dispatch]);

  // Handler functions for booking actions
  const handleMessage = (booking: Booking) => {
    // Navigate to messages page with the freelancer
    router.push(`/dashboard/messages?freelancerId=${booking.slot.freelancer.id}`);
  };

  const handleReschedule = (booking: Booking) => {
    // Navigate to freelancer page for rescheduling
    if (booking.slot?.freelancer?.id) {
      router.push(`/dashboard/freelancer/${booking.slot.freelancer.id}`);
    }
  };

  const handleCancel = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    setCancellingBookingId(bookingToCancel.id);
    try {
      await dispatch(
        cancelUserBooking({
          bookingId: bookingToCancel.id,
          reason: cancelReason || 'Cancelled by user',
        }) as any,
      ).unwrap();
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancelReason('');
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Filter and sort bookings based on search, status, and date
  const filteredBookings = bookings
    .filter((booking: Booking) => {
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
    })
    .sort((a: Booking, b: Booking) => {
      // Sort by date: closest to furthest
      const dateA = new Date(a.slot.startTime).getTime();
      const dateB = new Date(b.slot.startTime).getTime();
      return dateA - dateB;
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
      {/* Loading State */}
      {loading && (
        <div className="flex h-full items-center justify-center ">
          <LoadingSpinner size="lg" />
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
            onClick={() => dispatch(fetchUserBookings({ date: new Date().toISOString() }) as any)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State - Only show when no bookings at all */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don&apos;t have any bookings yet
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto"
            onClick={() => router.push('/dashboard/explore')}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Book New Session'}
          </Button>
        </div>
      )}

      {/* Main Content - Show when there are bookings */}
      {!loading && !error && bookings.length > 0 && (
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

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onMessage={handleMessage}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  cancellingBookingId={cancellingBookingId}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bookings match your filters
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {bookingToCancel && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  {bookingToCancel.slot.freelancer.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {new Date(bookingToCancel.slot.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  €{bookingToCancel.totalAmount} • {bookingToCancel.slot.duration} min
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700">
                  Reason for cancellation (optional)
                </label>
                <Input
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setBookingToCancel(null);
                setCancelReason('');
              }}
              disabled={cancellingBookingId === bookingToCancel?.id}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancellingBookingId === bookingToCancel?.id}
            >
              {cancellingBookingId === bookingToCancel?.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
}
