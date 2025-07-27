'use client';

import { addDays, format, isToday, isTomorrow } from 'date-fns';
import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  MapPin,
  Search,
  Star,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import {
  cancelUserBooking,
  clearSelectedBooking,
  fetchUserBookings,
  setSelectedBooking,
} from '@/redux/slices/bookingSlice';
import { RootState } from '@/redux/store';

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { bookings, loading, error, selectedBooking } = useSelector(
    (state: RootState) => state.booking,
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  // Fetch user bookings on component mount
  useEffect(() => {
    dispatch(fetchUserBookings({ date: selectedDate }) as any);
  }, [dispatch, selectedDate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Transform API data to match the table structure
  const transformedBookings = bookings.map((booking: any) => ({
    id: booking.id,
    slot: {
      id: booking.slot?.id || '',
      startTime: booking.slot?.startTime || '',
      endTime: booking.slot?.endTime || '',
      freelancer: {
        id: booking.slot?.freelancer?.id || '',
        name: booking.slot?.freelancer?.name || 'Unknown',
        specialty: booking.slot?.freelancer?.specialty || 'Healthcare Professional',
        avatar: booking.slot?.freelancer?.avatar || '',
      },
      location: booking.slot?.location
        ? {
            name: booking.slot.location.name || '',
            address: booking.slot.location.address || '',
          }
        : undefined,
    },
    status: booking.status || 'PENDING',
    totalAmount: booking.totalAmount || 0,
    services: booking.services || [],
    notes: booking.notes || '',
    createdAt: booking.createdAt || '',
  }));

  // Filter bookings based on search and status
  const filteredBookings = transformedBookings.filter((booking) => {
    const matchesSearch =
      booking.slot.freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.slot.freelancer.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    let badgeProps = {
      variant: 'secondary' as 'default' | 'secondary',
      className: 'text-sm',
      label: status,
      icon: null as any,
    };

    switch (status) {
      case 'CONFIRMED':
        badgeProps = {
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 text-sm',
          label: 'Confirmed',
          icon: CheckCircle,
        };
        break;
      case 'PENDING':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-sm',
          label: 'Pending',
          icon: ClockIcon,
        };
        break;
      case 'CANCELLED':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 text-sm',
          label: 'Cancelled',
          icon: XCircle,
        };
        break;
      case 'COMPLETED':
        badgeProps = {
          variant: 'default',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm',
          label: 'Completed',
          icon: CheckCircle,
        };
        break;
      default:
        badgeProps = {
          variant: 'secondary',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 text-sm',
          label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          icon: ClockIcon,
        };
    }

    const IconComponent = badgeProps.icon;
    return (
      <Badge variant={badgeProps.variant} className={badgeProps.className}>
        {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
        {badgeProps.label}
      </Badge>
    );
  };

  const getDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const getTimeDisplay = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 'Time TBD';
    return `${format(new Date(startTime), 'HH:mm')} - ${format(new Date(endTime), 'HH:mm')}`;
  };

  const getQuickDates = () => {
    const today = new Date();
    return [
      { date: format(today, 'yyyy-MM-dd'), label: 'Today' },
      { date: format(addDays(today, 1), 'yyyy-MM-dd'), label: 'Tomorrow' },
      { date: format(addDays(today, 7), 'yyyy-MM-dd'), label: 'Next Week' },
    ];
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = selectedDate || searchQuery || statusFilter !== 'all';

  // Cancel booking handler
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const handleCancel = async (bookingId: string) => {
    setCancelingId(bookingId);
    setShowCancelDialog(true);
  };
  const confirmCancel = async () => {
    if (!cancelingId) return;
    try {
      await dispatch(cancelUserBooking(cancelingId) as any).unwrap();
      toast.success('Booking cancelled successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel booking');
    } finally {
      setShowCancelDialog(false);
      setCancelingId(null);
    }
  };

  // useEffect(() => {
  //   if (selectedBooking) {
  //     // Wait for Redux to update selectedBooking, then navigate
  //     isNavigatingRef.current = true;
  //     router.push(`/dashboard/my-bookings/${selectedBooking.id}`);
  //     dispatch(clearSelectedBooking());
  //     setTimeout(() => {
  //       isNavigatingRef.current = false;
  //     }, 500); // Prevent double navigation
  //   }
  // }, [selectedBooking, router, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Airbnb/Booking.com style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {filteredBookings.length} appointment{filteredBookings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Section */}
        <div className="mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by doctor or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Date Filter */}
                <div>
                  <Input
                    type="date"
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value || undefined)}
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Quick Date Filters */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {getQuickDates().map(({ date, label }) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDate(selectedDate === date ? undefined : date)}
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {filteredBookings.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? 'No bookings match your current filters. Try adjusting your search criteria.'
                  : "You don't have any bookings yet. Start by exploring healthcare professionals and making your first appointment."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Healthcare Professional Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg font-bold">
                        {booking.slot.freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {booking.slot.freelancer.name}
                          </h3>
                          <p className="text-gray-600">{booking.slot.freelancer.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">4.8</span>
                            </div>
                            <span className="text-sm text-gray-500">(127 reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{getDateDisplay(booking.slot.startTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">
                              {getTimeDisplay(booking.slot.startTime, booking.slot.endTime)}
                            </p>
                          </div>
                        </div>
                        {booking.slot.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium truncate">{booking.slot.location.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Services and Pricing */}
                      {booking.services && booking.services.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.services.map((service: any, index: number) => (
                              <Badge
                                key={service.id || index}
                                variant="outline"
                                className="text-xs"
                              >
                                {service.name} - €{service.price}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Separator className="my-4" />
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Total:</span>
                          <span className="text-lg font-bold text-blue-600">
                            €{booking.totalAmount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => dispatch(setSelectedBooking(booking))}
                          >
                            View Details
                          </Button>
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              onClick={() =>
                                router.push(
                                  `/dashboard/doctors/${booking.slot.freelancer.id}?rescheduleBookingId=${booking.id}`,
                                )
                              }
                            >
                              Reschedule
                            </Button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              onClick={() => handleCancel(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
                  <p className="mb-6 text-gray-600">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      No, keep it
                    </Button>
                    <Button variant="destructive" onClick={confirmCancel} isLoading={loading}>
                      Yes, cancel it
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) dispatch(clearSelectedBooking());
        }}
      >
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Here are the details for your selected booking.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Professional & Appointment Info */}
              <div className="space-y-6">
                {/* Professional Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg font-bold">
                      {selectedBooking.slot?.freelancer?.name?.charAt(0) || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedBooking.slot?.freelancer?.name}
                    </h3>
                    <p className="text-gray-600">{selectedBooking.slot?.freelancer?.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-gray-500">(127 reviews)</span>
                    </div>
                  </div>
                </div>
                {/* Status & Booking ID */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    {selectedBooking.status}
                  </Badge>
                  <span className="text-xs text-gray-400">ID: {selectedBooking.id}</span>
                </div>
                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Created:{' '}
                  {selectedBooking.createdAt
                    ? new Date(selectedBooking.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </div>
                {/* Appointment Details */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {selectedBooking.slot?.startTime
                        ? new Date(selectedBooking.slot.startTime).toLocaleDateString()
                        : 'Date TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {selectedBooking.slot?.startTime && selectedBooking.slot?.endTime
                        ? `${new Date(selectedBooking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedBooking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Time TBD'}
                    </span>
                  </div>
                  {selectedBooking.slot?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.slot.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Services, Notes, Total, CTAs */}
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {/* Services */}
                  {selectedBooking.services && selectedBooking.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Services</h4>
                      <ul className="list-disc pl-5">
                        {selectedBooking.services.map((service: any, idx: number) => (
                          <li key={service.id || idx} className="flex justify-between">
                            <span>{service.name}</span>
                            <span className="text-xs text-gray-500">€{service.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Notes */}
                  {selectedBooking.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
                {/* Total & CTAs */}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      €{selectedBooking.totalAmount}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    {selectedBooking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        className="flex-1 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        onClick={() => {
                          // Implement reschedule logic or navigation here
                        }}
                      >
                        Reschedule
                      </Button>
                    )}
                    {selectedBooking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() => {
                          // Implement cancel logic here
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => dispatch(clearSelectedBooking())}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
