'use client';

import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from 'date-fns';
import {
  AlertCircle,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Home,
  MapPin,
  MessageCircle,
  Plus,
  Stethoscope,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DatePicker } from '@/components/common/input/DatePicker';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { CreateSlotForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { deleteSlot, fetchSlots } from '@/redux/slices/slotSlice';
import { RootState } from '@/redux/store';
import { LocationType, Slot } from '@/types/types';

const SlotsPage = () => {
  const dispatch = useAppDispatch();
  const { slots, isLoading, isCreating } = useSelector((state: RootState) => state.slot);
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    dispatch(fetchSlots({ page: 1, limit: 100 }) as any);
  }, [dispatch]);

  const handleSlotCreateSuccess = () => {
    setShowCreateSlotForm(false);
    dispatch(fetchSlots({ page: 1, limit: 100 }) as any);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    setShowDeleteDialog(false);
    setSelectedSlot(null);
    try {
      await dispatch(deleteSlot(selectedSlot.id) as any).unwrap();
      toast.success('Slot deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot');
      dispatch(fetchSlots({ page: 1, limit: 100 }) as any);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newWeekStart = addDays(currentWeekStart, -7);
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(newWeekStart);
    } else {
      const newWeekStart = addDays(currentWeekStart, 7);
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(newWeekStart);
    }
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(date);
      setShowDatePicker(false);
    }
  };

  const getWeekDays = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  };

  const getSlotsForDate = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, date);
    });
  };

  const selectedDateSlots = getSlotsForDate(selectedDate);

  const getLocationIcon = (locationType: LocationType) => {
    switch (locationType) {
      case LocationType.VIRTUAL:
        return <Video className="h-4 w-4 text-purple-500" />;
      case LocationType.HOME:
        return <Home className="h-4 w-4 text-orange-500" />;
      case LocationType.OFFICE:
        return <Building className="h-4 w-4 text-blue-500" />;
      case LocationType.CLINIC:
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLocationLabel = (locationType: LocationType) => {
    switch (locationType) {
      case LocationType.VIRTUAL:
        return 'Virtual';
      case LocationType.HOME:
        return 'Home Visit';
      case LocationType.OFFICE:
        return 'Office';
      case LocationType.CLINIC:
        return 'Clinic';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (slot: Slot) => {
    switch (slot.status) {
      case 'BOOKED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CheckCircle className="h-3 w-3" /> Booked
          </span>
        );
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            <Clock className="h-3 w-3" /> Available
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
            <AlertCircle className="h-3 w-3" /> Reserved
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const renderSlotCard = (slot: Slot) => {
    const slotDate = new Date(slot.startTime);
    const client = slot.booking?.client;
    const clientInitials = client?.name
      ? client.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
      : '';

    return (
      <Card
        key={slot.id}
        className="mb-4 border-0 shadow-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl transition-all duration-300"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Time and Status Section */}
            <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start min-w-[120px] lg:min-w-[120px]">
              <div className="flex flex-col items-center lg:items-start">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {format(slotDate, 'HH:mm')}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  {slot.duration} minutes
                </div>
                <div className="mb-2 sm:mb-3">{getStatusBadge(slot)}</div>
              </div>
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-green-600 lg:mt-auto">
                €{slot.basePrice}
              </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1">
              {/* Location and Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 rounded-lg w-fit">
                  {getLocationIcon(slot.locationType)}
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {getLocationLabel(slot.locationType)}
                  </span>
                </div>
                {slot.location?.name && (
                  <div className="text-xs sm:text-sm text-gray-600">at {slot.location.name}</div>
                )}
              </div>

              {/* Client Information (if booked) */}
              {slot.status === 'BOOKED' && client && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {client.profilePicture ? (
                      <Image
                        src={client.profilePicture}
                        alt={client.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-green-200"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                        {clientInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                        Booked by {client.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">
                        {client.email}
                      </div>
                      {slot.booking?.clientAddress && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                          📍 {slot.booking.clientAddress}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="bg-white w-full sm:w-auto">
                      <MessageCircle className="h-4 w-4 mr-2" /> Message
                    </Button>
                  </div>
                  {slot.booking?.notes && (
                    <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border border-green-100">
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client Notes:
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{slot.booking.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Cancelled Booking Information (if slot has a cancelled booking) */}
              {slot.booking && slot.booking.status === 'CANCELLED' && client && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {client.profilePicture ? (
                      <Image
                        src={client.profilePicture}
                        alt={client.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-200 opacity-75"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg opacity-75">
                        {clientInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-lg font-semibold text-gray-900 opacity-75 truncate">
                        Cancelled by {client.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 opacity-75 truncate">
                        {client.email}
                      </div>
                      {slot.booking?.clientAddress && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-1 opacity-75 truncate">
                          📍 {slot.booking.clientAddress}
                        </div>
                      )}
                      <div className="text-xs sm:text-sm text-red-600 font-medium mt-1">
                        Cancelled on {format(new Date(slot.booking.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        <XCircle className="h-3 w-3" /> Cancelled
                      </span>
                    </div>
                  </div>
                  {slot.booking?.notes && (
                    <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border border-red-100 opacity-75">
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Client Notes:
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{slot.booking.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Messages */}
              {slot.status === 'AVAILABLE' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-blue-900">
                        No bookings yet
                      </div>
                      <div className="text-xs sm:text-sm text-blue-700">
                        You&apos;re available for this time slot!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slot.status === 'RESERVED' && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-yellow-900">
                        Reserved
                      </div>
                      <div className="text-xs sm:text-sm text-yellow-700">
                        Someone is about to book this slot
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slot.status === 'CANCELLED' && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4 opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-red-900">Cancelled</div>
                      <div className="text-xs sm:text-sm text-red-700">This slot was cancelled</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 lg:items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateSlotForm(true)}
                className="flex-1 lg:flex-none lg:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowDeleteDialog(true);
                }}
                className="flex-1 lg:flex-none lg:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
              <p className="text-gray-600 mt-1">
                Manage your availability and see your bookings in a simple calendar view
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 my-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-blue-900 mb-1">How to use your calendar</div>
            <div className="text-sm text-blue-800">
              Click on any day to see your slots. Green dots mean booked, blue dots mean available.
              Add your availability and clients can book your time!
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowDatePicker(true)}
              className="text-base sm:text-lg font-semibold text-gray-900 hover:bg-gray-100 px-2 sm:px-4 py-2 text-center min-w-[140px] sm:min-w-[200px]"
            >
              {format(currentWeekStart, 'MMM d')} -{' '}
              {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-10 w-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4">
            {slots.length > 0 && (
              <Button
                onClick={() => setShowCreateSlotForm(true)}
                disabled={isCreating}
                className="h-11 px-6"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Availability
                  </>
                )}
              </Button>
            )}

            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="p-2 sm:p-4 text-center">
                <div className="text-xs sm:text-sm font-semibold text-gray-700">{day}</div>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {getWeekDays().map((date) => {
              const daySlots = getSlotsForDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasSlots = daySlots.length > 0;
              const bookedCount = daySlots.filter((s) => s.status === 'BOOKED').length;
              const availableCount = daySlots.filter((s) => s.status === 'AVAILABLE').length;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] p-2 sm:p-3 lg:p-4 border-r border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                    isSelected ? 'bg-blue-50 border-blue-300 shadow-inner' : ''
                  } ${isCurrentDay ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <span
                      className={`text-sm sm:text-base lg:text-lg font-bold text-center ${
                        isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {format(date, 'd')}
                    </span>
                  </div>

                  {hasSlots && (
                    <div className="space-y-1 sm:space-y-2">
                      {bookedCount > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 font-medium hidden sm:inline">
                            {bookedCount} booked
                          </span>
                          <span className="text-green-700 font-medium sm:hidden">
                            {bookedCount}
                          </span>
                        </div>
                      )}
                      {availableCount > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700 font-medium hidden sm:inline">
                            {availableCount} available
                          </span>
                          <span className="text-blue-700 font-medium sm:hidden">
                            {availableCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-gray-600">
                {selectedDateSlots.length} slot{selectedDateSlots.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>

          {selectedDateSlots.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No slots for this day
              </h4>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                You haven&apos;t scheduled any time slots for {format(selectedDate, 'MMMM d, yyyy')}
                .
              </p>
              <Button onClick={() => setShowCreateSlotForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Time Slots
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateSlots
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(renderSlotCard)}
            </div>
          )}
        </div>
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>Choose a date to navigate to that week</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DatePicker value={selectedDate} onChange={handleDatePickerChange} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Slot Form Dialog */}
      <Dialog open={showCreateSlotForm} onOpenChange={setShowCreateSlotForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your Availability</DialogTitle>
            <DialogDescription>
              Set up your available times for clients to book. You can add multiple slots at once.
            </DialogDescription>
          </DialogHeader>
          <CreateSlotForm onSuccess={handleSlotCreateSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Slot Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Slot
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Cancel Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
