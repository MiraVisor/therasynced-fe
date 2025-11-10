'use client';

import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { BookingDetailsModal } from '@/components/core/Dashboard/UserSide/MyBookings/BookingDetailsModal';
import { DayBookingSection } from '@/components/core/Dashboard/UserSide/MyBookings/DayBookingSection';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingCardSkeleton } from '@/components/ui/skeletons/BookingCardSkeleton';
import * as bookingApi from '@/redux/api/bookingApi';
import { cancelUserBooking, fetchUserBookings } from '@/redux/slices/bookingSlice';
import { RootState } from '@/redux/store';
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
      trend: {
        value: displayStats.totalBookings > 0 ? 15.2 : 0,
        isUp: true,
        label: 'all time',
      },
      icon: CalendarIcon,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
      sparklineData: [8, 10, 12, 11, 13, 15, displayStats.totalBookings],
    },
    {
      title: 'Upcoming',
      value: displayStats.upcomingBookings.toString(),
      trend: {
        value: displayStats.upcomingBookings > 0 ? 25.0 : 0,
        isUp: true,
        label: 'this month',
      },
      icon: Clock,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      sparklineData: [2, 3, 4, 3, 5, displayStats.upcomingBookings, displayStats.upcomingBookings],
    },
    {
      title: 'Completed',
      value: displayStats.completedBookings.toString(),
      trend: {
        value: displayStats.completedBookings > 0 ? 30.5 : 0,
        isUp: true,
        label: 'this month',
      },
      icon: User,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      sparklineData: [
        5,
        6,
        8,
        7,
        9,
        displayStats.completedBookings,
        displayStats.completedBookings,
      ],
    },
    {
      title: 'Cancelled',
      value: displayStats.cancelledBookings.toString(),
      trend: {
        value: displayStats.cancelledBookings > 0 ? -10.2 : 0,
        isUp: false,
        label: 'this month',
      },
      icon: CalendarIcon,
      iconBg: 'bg-error/10',
      iconColor: 'text-error',
      sparklineData: [
        3,
        2,
        2,
        1,
        1,
        displayStats.cancelledBookings,
        displayStats.cancelledBookings,
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={Icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            sparklineData={stat.sparklineData}
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);

  const fetchBookingStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await bookingApi.getPatientBookingStats();
      setBookingStats(response.data);
    } catch (error) {
      console.error('Failed to fetch booking stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch stats only once on initial load
  useEffect(() => {
    fetchBookingStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch bookings for the week
  useEffect(() => {
    const fetchBookingsForWeek = async () => {
      const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      // Fetch with pagination and sorting
      dispatch(
        fetchUserBookings({
          page: 1,
          limit: 1000,
          sortBy: 'slot.startTime',
          sortOrder: 'asc',
          date: weekStart.toISOString().split('T')[0], // Format: YYYY-MM-DD
        }) as any,
      );
    };

    fetchBookingsForWeek();
  }, [dispatch, currentWeekStart]);

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
    // Navigate to review page or open review modal
    // For now, we'll show a toast - you can implement a review modal/route later
    toast.info('Review functionality coming soon');
    // router.push(`/dashboard/bookings/${booking.id}/review`);
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
      fetchBookingStats(); // Refresh stats after cancellation
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const navigateWeek = async (direction: 'prev' | 'next') => {
    setIsNavigatingWeek(true);
    try {
      if (direction === 'prev') {
        const newDate = addDays(currentWeekStart, -7);
        // Ensure we're at the start of the week
        setCurrentWeekStart(startOfWeek(newDate, { weekStartsOn: 1 }));
      } else {
        const newDate = addDays(currentWeekStart, 7);
        // Ensure we're at the start of the week
        setCurrentWeekStart(startOfWeek(newDate, { weekStartsOn: 1 }));
      }
    } finally {
      setIsNavigatingWeek(false);
    }
  };

  // Calendar date picker handler
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      // Navigate to the week containing the selected date
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(weekStart);
    }
  };

  // Get all days in the current week for highlighting
  const getCurrentWeekDaysForHighlight = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  };

  const currentWeekDays = getCurrentWeekDaysForHighlight();

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
            onClick={() => dispatch(fetchUserBookings({ date: new Date().toISOString() }) as any)}
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
                  variant="outline"
                  className="h-10 px-4 font-poppins font-medium text-charcoal hover:bg-gray-50 flex items-center gap-2"
                  disabled={isNavigatingWeek}
                >
                  <CalendarIcon className="h-4 w-4" />

                  <span className="text-base lg:text-lg">
                    {`${format(currentWeekStart, 'do MMM')} - ${format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'do MMM')}`}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={currentWeekStart}
                  onSelect={handleCalendarDateSelect}
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear() - 2}
                  toYear={new Date().getFullYear() + 1}
                  weekStartsOn={1}
                  modifiers={{
                    selectedWeek: currentWeekDays,
                  }}
                  modifiersClassNames={{
                    selectedWeek: 'bg-primary/10 text-primary font-semibold',
                  }}
                  className="rounded-md border-0"
                />
                <div className="p-3 pt-0 border-t">
                  <div className="text-xs font-inter text-muted-foreground text-center">
                    Showing bookings for the week of {format(currentWeekStart, 'MMM d, yyyy')} -{' '}
                    {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                  </div>
                </div>
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

          {/* Day Sections */}
          {loading ? (
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
    </DashboardPageWrapper>
  );
}
