'use client';

import { useQueryClient } from '@tanstack/react-query';
import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { BookingDetailsModal } from '@/components/core/Dashboard/UserSide/MyBookings/BookingDetailsModal';
import { DayBookingSection } from '@/components/core/Dashboard/UserSide/MyBookings/DayBookingSection';
import { RatingModal } from '@/components/core/Dashboard/UserSide/Ratings/RatingModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookingCardSkeleton } from '@/components/ui/skeletons/BookingCardSkeleton';
import {
  useCancelBooking,
  usePatientBookings,
  usePatientBookingStats,
} from '@/hooks/queries/useBookings';
import { Booking, BookingStats } from '@/types/types';

// Stats Section Component
const BookingStatsComponent = ({
  stats,
  isLoading,
}: {
  stats: BookingStats | null;
  isLoading: boolean;
}) => {
  const displayStats = stats || {
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  };

  const statsData = [
    {
      title: 'Total Bookings',
      value: displayStats.totalBookings.toString(),
      icon: CalendarIcon,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      title: 'Upcoming',
      value: displayStats.upcomingBookings.toString(),
      icon: Clock,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      title: 'Completed',
      value: displayStats.completedBookings.toString(),
      icon: User,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Cancelled',
      value: displayStats.cancelledBookings.toString(),
      icon: CalendarIcon,
      iconBg: 'bg-error/10',
      iconColor: 'text-error',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={Icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            interactive
            loading={isLoading}
            bookingSkeleton={true}
            onClick={() => {
              // Navigate to details or filter
            }}
          />
        );
      })}
    </div>
  );
};

// Filters Component

export default function MyBookingsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);

  // Calculate week date for query
  const weekDate = currentWeekStart.toISOString().split('T')[0];

  // Use React Query hooks
  const {
    data: bookings = [],
    isLoading: loading,
    isFetching: initialLoading,
    error,
  } = usePatientBookings({
    page: 1,
    limit: 1000,
    sortBy: 'slot.startTime',
    sortOrder: 'asc',
    date: weekDate,
  });

  const { data: bookingStats, isLoading: isLoadingStats } = usePatientBookingStats();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleReview = (booking: Booking) => {
    setBookingToRate(booking);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    // Refresh bookings after successful rating
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['ratings'] });
  };

  const confirmCancel = () => {
    if (!bookingToCancel) return;

    cancelBooking(
      {
        bookingId: bookingToCancel.id,
        reason: cancelReason || 'Cancelled by user',
      },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          setBookingToCancel(null);
          setCancelReason('');
          setCancellingBookingId(null);
        },
        onError: () => {
          setCancellingBookingId(null);
        },
      },
    );
  };

  const queryClient = useQueryClient();

  const navigateWeek = (direction: 'prev' | 'next') => {
    setIsNavigatingWeek(true);
    if (direction === 'prev') {
      const newWeekStart = addDays(currentWeekStart, -7);
      setCurrentWeekStart(newWeekStart);
    } else {
      const newWeekStart = addDays(currentWeekStart, 7);
      setCurrentWeekStart(newWeekStart);
    }
    // React Query will automatically refetch when currentWeekStart changes
    setTimeout(() => setIsNavigatingWeek(false), 500);
  };

  // Calendar date picker handler
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(newWeekStart);
      // React Query will automatically refetch
    }
  };

  // Get all days in the current week for highlighting

  // Filter and sort bookings based on search, status, and date
  const filteredBookings = bookings
    .filter((booking: Booking) => {
      const matchesSearch =
        booking.slot.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.serviceCategories &&
          booking.serviceCategories.length > 0 &&
          booking.serviceCategories.some((cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )) ||
        (booking.services &&
          booking.services.length > 0 &&
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

  const getWeekDays = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  };

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter((booking: Booking) => {
      const bookingDate = new Date(booking.slot.startTime);
      return isSameDay(bookingDate, date);
    });
  };

  const weekDays = getWeekDays();

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-poppins font-bold text-charcoal">My Bookings</h1>
          <p className="font-inter text-muted-foreground">
            Manage and track all your therapy sessions
          </p>
        </div>
      }
    >
      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
            Error loading bookings
          </h3>
          <p className="font-inter text-muted-foreground mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Main Content - Always show stats and navigation, even during loading */}
      {!error && (
        <div className="space-y-6">
          {/* Stats Section */}
          <BookingStatsComponent stats={bookingStats} isLoading={isLoadingStats} />

          {/* Week Navigation */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="h-10 w-10 p-0"
                disabled={isNavigatingWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-base lg:text-lg font-semibold text-charcoal hover:bg-gray-100 px-4 py-2"
                    disabled={isNavigatingWeek}
                  >
                    {format(currentWeekStart, 'MMM d')} -{' '}
                    {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={currentWeekStart}
                    onSelect={(date) => {
                      if (date) {
                        handleCalendarDateSelect(date);
                      }
                    }}
                    initialFocus
                    className="rounded-md border"
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="h-10 w-10 p-0"
                disabled={isNavigatingWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day Sections */}
          {initialLoading || (loading && bookings.length === 0) ? (
            <div className="space-y-4">
              {weekDays.map((date) => (
                <div key={date.toISOString()}>
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
                    <div className="p-4 lg:p-6">
                      <div className="flex items-center gap-3 lg:gap-4 flex-1 text-left">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded animate-pulse w-32" />
                        <div className="flex gap-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700/20 rounded animate-pulse w-16" />
                          <div className="h-5 bg-gray-200 dark:bg-gray-700/20 rounded animate-pulse w-16" />
                          <div className="h-5 bg-gray-200 dark:bg-gray-700/20 rounded animate-pulse w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <BookingCardSkeleton key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
                No bookings this week
              </h3>
              <p className="font-inter text-muted-foreground">
                You don&apos;t have any bookings for this week. Try navigating to a different week.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weekDays.map((date) => {
                const dayBookings = getBookingsForDate(date);
                return (
                  <div key={date.toISOString()}>
                    <DayBookingSection
                      date={date}
                      bookings={dayBookings}
                      onBookingClick={handleBookingClick}
                      onMessage={handleMessage}
                      onReschedule={handleReschedule}
                      onCancel={handleCancel}
                      cancellingBookingId={cancellingBookingId}
                    />
                  </div>
                );
              })}
            </div>
          )}
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
              {isCancelling || cancellingBookingId === bookingToCancel?.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        booking={selectedBooking}
        onMessage={handleMessage}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
        onReview={handleReview}
        cancellingBookingId={cancellingBookingId}
      />

      {/* Rating Modal */}
      <RatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        booking={bookingToRate}
        onSuccess={handleRatingSuccess}
      />
    </DashboardPageWrapper>
  );
}
