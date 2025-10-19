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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MessageCircle,
  Plus,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DatePicker } from '@/components/common/input/DatePicker';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { CreateSlotForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { deleteSlot, fetchMySlots } from '@/redux/slices/slotSlice';
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
    dispatch(fetchMySlots({ page: 1, limit: 100 }) as any);
  }, [dispatch]);

  const handleSlotCreateSuccess = () => {
    setShowCreateSlotForm(false);
    dispatch(fetchMySlots({ page: 1, limit: 100 }) as any);
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
      dispatch(fetchMySlots({ page: 1, limit: 100 }) as any);
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

    const getStatusColor = () => {
      switch (slot.status) {
        case 'BOOKED':
          return 'border-l-green-500 bg-green-50/30';
        case 'AVAILABLE':
          return 'border-l-blue-500 bg-blue-50/30';
        case 'RESERVED':
          return 'border-l-yellow-500 bg-yellow-50/30';
        case 'CANCELLED':
          return 'border-l-red-500 bg-red-50/30';
        default:
          return 'border-l-gray-500 bg-gray-50/30';
      }
    };

    return (
      <Card
        key={slot.id}
        className={`mb-3 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor()} border-l-4`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Time & Status */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="text-xl font-bold text-gray-900">{format(slotDate, 'HH:mm')}</div>
                <div className="text-sm text-gray-500">{slot.duration}min</div>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex flex-col">
                <div className="mb-1">{getStatusBadge(slot)}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {slot.locationType === LocationType.HOME ? (
                    <>
                      <Home className="h-4 w-4" /> Home Visit
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4" /> Clinic
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Price & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-primary">€{slot.basePrice}</div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowDeleteDialog(true);
                }}
                className="h-8 w-8 p-0 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Client Info Row - Only for booked slots */}
          {slot.status === 'BOOKED' && client && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 rounded-full border-2 border-primary group-hover:border-primary/40 transition-colors flex-shrink-0">
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{client.name}</div>
                  <div className="text-xs text-gray-500 truncate">{client.email}</div>
                </div>
                {slot.booking?.notes && (
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-blue-600" />
                  </div>
                )}
              </div>

              {slot.booking?.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600">
                    <strong>Notes:</strong> {slot.booking.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancelled booking info */}
          {slot.status === 'CANCELLED' && slot.booking && (
            <div className="mt-3 pt-3 border-t border-gray-100 opacity-60">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div className="text-sm text-gray-600">
                  Cancelled on {format(new Date(slot.booking.updatedAt), 'MMM d')}
                </div>
              </div>
            </div>
          )}
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
            <Button
              onClick={() => setShowCreateSlotForm(true)}
              disabled={isCreating}
              className="h-11 px-6"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Availability
                </>
              )}
            </Button>
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
