'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable, FilterOption } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { BookingDetailsModal } from '@/components/core/Dashboard/UserSide/MyBookings/BookingDetailsModal';
import { createBookingColumns } from '@/components/core/Dashboard/UserSide/MyBookings/BookingTableColumns';
import { RescheduleBookingDialog } from '@/components/core/Dashboard/UserSide/MyBookings/RescheduleBookingDialog';
import { RatingModal } from '@/components/core/Dashboard/UserSide/Ratings/RatingModal';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCancelBooking,
  usePatientBookings,
  usePatientBookingStats,
} from '@/hooks/queries/useBookings';
import { cn } from '@/lib/utils';
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
    },
    {
      title: 'Upcoming',
      value: displayStats.upcomingBookings.toString(),
    },
    {
      title: 'Completed',
      value: displayStats.completedBookings.toString(),
    },
    {
      title: 'Cancelled',
      value: displayStats.cancelledBookings.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {statsData.map((stat, index) => {
        return (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
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
  const searchParams = useSearchParams();
  const bookingIdFromUrl = searchParams.get('bookingId');

  const [statusFilter, setStatusFilter] = useState<string>('upcoming'); // Default to upcoming
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);

  // Use React Query hooks - fetch all bookings without date filter
  const {
    data: bookings = [],
    isFetching: initialLoading,
    error,
  } = usePatientBookings({
    page: 1,
    limit: 1000,
    sortBy: 'slot.startTime',
    sortOrder: 'desc', // Show newest first
  });

  const {
    data: bookingStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = usePatientBookingStats();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  // Show error toast only when no cached data exists
  if (error && bookings.length === 0) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings';
    toast.error(errorMessage);
  }

  if (statsError && !bookingStats) {
    const errorMessage =
      statsError instanceof Error ? statsError.message : 'Failed to load booking stats';
    toast.error(errorMessage);
  }

  // Handler functions for booking actions
  const handleMessage = (booking: Booking) => {
    // Navigate to messages page with the freelancer
    router.push(`/dashboard/messages?freelancerId=${booking.slot.freelancer.id}`);
  };

  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
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

  // Get unique service categories from bookings
  const uniqueServiceCategories = useMemo(() => {
    const categories = new Map<string, string>();
    bookings.forEach((booking) => {
      const serviceCats = booking.serviceCategories || booking.services || [];
      serviceCats.forEach((cat) => {
        if (!categories.has(cat.id)) {
          categories.set(cat.id, cat.name);
        }
      });
    });
    return Array.from(categories.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'upcoming') count++; // Upcoming is default
    if (dateRangeFilter !== 'all') count++;
    if (selectedDate) count++;
    if (serviceCategoryFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    return count;
  }, [statusFilter, dateRangeFilter, selectedDate, serviceCategoryFilter, locationFilter]);

  // Auto-open details modal if bookingId is in URL
  useEffect(() => {
    if (bookingIdFromUrl && bookings.length > 0) {
      const booking = bookings.find((b: Booking) => b.id === bookingIdFromUrl);
      if (booking) {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
        // Clear the URL parameter after opening the modal
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('bookingId');
        const newUrl = newSearchParams.toString()
          ? `${window.location.pathname}?${newSearchParams.toString()}`
          : window.location.pathname;
        router.replace(newUrl);
      }
    }
  }, [bookingIdFromUrl, bookings, router, searchParams]);

  // Filter bookings based on all filters
  const filteredBookings = useMemo(() => {
    // If bookingId is in URL, filter to show only that booking
    if (bookingIdFromUrl) {
      return bookings.filter((booking: Booking) => booking.id === bookingIdFromUrl);
    }

    return bookings.filter((booking: Booking) => {
      const bookingDate = new Date(booking.slot.startTime);
      const now = new Date();
      const isPast = bookingDate < now;
      const isUpcoming = booking.status === 'CONFIRMED' && !isPast;

      // Status filter
      const matchesStatus = (() => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'upcoming') return isUpcoming;
        if (statusFilter === 'completed') return isPast || booking.status === 'COMPLETED';
        if (statusFilter === 'cancelled') return booking.status === 'CANCELLED';
        if (statusFilter === 'rescheduled') return booking.status === 'RESCHEDULED';
        return true;
      })();

      // Date range filter
      const matchesDateRange = (() => {
        if (dateRangeFilter === 'all') return true;
        const daysDiff = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (dateRangeFilter === 'today') {
          return format(bookingDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        }
        if (dateRangeFilter === 'thisWeek') {
          return daysDiff >= 0 && daysDiff <= 7;
        }
        if (dateRangeFilter === 'thisMonth') {
          return daysDiff >= 0 && daysDiff <= 30;
        }
        if (dateRangeFilter === 'past') {
          return isPast;
        }
        return true;
      })();

      // Specific date filter
      const matchesSpecificDate = (() => {
        if (!selectedDate) return true;
        return format(bookingDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      })();

      // Service category filter
      const matchesServiceCategory = (() => {
        if (serviceCategoryFilter === 'all') return true;
        const serviceCats = booking.serviceCategories || booking.services || [];
        return serviceCats.some((cat) => cat.id === serviceCategoryFilter);
      })();

      // Location filter
      const matchesLocation = (() => {
        if (locationFilter === 'all') return true;
        return booking.slot.locationType === locationFilter;
      })();

      return (
        matchesStatus &&
        matchesDateRange &&
        matchesSpecificDate &&
        matchesServiceCategory &&
        matchesLocation
      );
    });
  }, [
    bookings,
    statusFilter,
    dateRangeFilter,
    selectedDate,
    serviceCategoryFilter,
    locationFilter,
    bookingIdFromUrl,
  ]);

  // Create table columns
  const columns = useMemo(
    () =>
      createBookingColumns({
        onBookingClick: handleBookingClick,
        onMessage: handleMessage,
        onReschedule: handleReschedule,
        onCancel: handleCancel,
        onRate: handleReview,
        cancellingBookingId,
      }) as ColumnDef<Booking, unknown>[],
    [cancellingBookingId],
  );

  // Filter options
  const statusFilterOptions: FilterOption[] = [
    { label: 'All Bookings', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Rescheduled', value: 'rescheduled' },
  ];

  const dateRangeFilterOptions: FilterOption[] = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Past', value: 'past' },
  ];

  const locationFilterOptions: FilterOption[] = [
    { label: 'All Locations', value: 'all' },
    { label: 'Home', value: 'HOME' },
    { label: 'Clinic', value: 'CLINIC' },
  ];

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
          <p className="font-inter text-muted-foreground mb-4">
            {error instanceof Error ? error.message : String(error)}
          </p>
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
          <BookingStatsComponent stats={bookingStats || null} isLoading={isLoadingStats} />

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('upcoming');
                setDateRangeFilter('all');
                setSelectedDate(undefined);
              }}
            >
              Upcoming
            </Button>
            <Button
              variant={dateRangeFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateRangeFilter('today');
                setStatusFilter('all');
                setSelectedDate(undefined);
              }}
            >
              Today
            </Button>
            <Button
              variant={dateRangeFilter === 'thisWeek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateRangeFilter('thisWeek');
                setStatusFilter('all');
                setSelectedDate(undefined);
              }}
            >
              This Week
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('completed');
                setDateRangeFilter('all');
                setSelectedDate(undefined);
              }}
            >
              Completed
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('upcoming');
                  setDateRangeFilter('all');
                  setSelectedDate(undefined);
                  setServiceCategoryFilter('all');
                  setLocationFilter('all');
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Bookings Table with Collapsible Filters */}
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header with Title and Filters Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 border-b bg-white gap-4">
              <h2 className="font-poppins text-[22px] font-bold tracking-tight text-charcoal">
                My Bookings
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Collapsible Filters Section */}
            {showFilters && (
              <div className="px-4 py-4 border-b bg-gray-50 animate-in slide-in-from-top duration-200">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusFilterOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Date Range
                      </label>
                      <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Filter by date range" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRangeFilterOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specific Date Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Specific Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-9 justify-start text-left font-normal',
                              !selectedDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                setDateRangeFilter('all');
                              }
                            }}
                            initialFocus
                          />
                          {selectedDate && (
                            <div className="p-3 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedDate(undefined);
                                }}
                              >
                                Clear Date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Service Category Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Service
                      </label>
                      <Select
                        value={serviceCategoryFilter}
                        onValueChange={setServiceCategoryFilter}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Filter by service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          {uniqueServiceCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Location
                      </label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Filter by location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationFilterOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table Content - Use DataTable but without its border */}
            <div className="[&>div]:border-0 [&>div]:rounded-none">
              <DataTable
                columns={columns}
                data={filteredBookings}
                title=""
                enableSorting={false}
                enableFiltering={false}
                enablePagination={true}
                pageSize={10}
                showSearch={false}
                showSorting={false}
                loading={initialLoading}
                initialLoading={initialLoading}
              />
            </div>
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

      {/* Reschedule Booking Dialog */}
      {rescheduleBooking && (
        <RescheduleBookingDialog
          open={!!rescheduleBooking}
          onOpenChange={(open) => {
            if (!open) setRescheduleBooking(null);
          }}
          booking={rescheduleBooking}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            setRescheduleBooking(null);
          }}
        />
      )}
    </DashboardPageWrapper>
  );
}
