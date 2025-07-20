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
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { deleteSlot, fetchSlots } from '@/redux/slices/slotSlice';
import { RootState } from '@/redux/store';
import { LocationType, Slot } from '@/types/types';

const SlotsPage = () => {
  const dispatch = useDispatch();
  const { slots, isLoading, isCreating } = useSelector((state: RootState) => state.slot);
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = () => {
    dispatch(fetchSlots({ page: 1, limit: 20 }) as any);
  };

  const handleSlotCreateSuccess = () => {
    setShowCreateSlotForm(false);
    loadSlots();
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    const slotToDelete = selectedSlot;
    setShowDeleteDialog(false);
    setSelectedSlot(null);

    try {
      await dispatch(deleteSlot(slotToDelete.id) as any).unwrap();
      toast.success('Slot deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot');
      loadSlots();
    }
  };

  const getLocationTypeLabel = (locationType: LocationType) => {
    const configs = {
      [LocationType.VIRTUAL]: 'Online',
      [LocationType.HOME]: 'Home Visit',
      [LocationType.OFFICE]: 'Office',
      [LocationType.CLINIC]: 'Clinic',
    };
    return configs[locationType];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600';
      case 'BOOKED':
        return 'text-blue-600';
      case 'RESERVED':
        return 'text-yellow-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Time Slots</h2>
            {isCreating && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="hidden sm:inline">Creating slots...</span>
                <span className="sm:hidden">Creating...</span>
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            See your scheduled time slots and manage your availability
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Date Timeline Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {/* Date Picker Trigger */}
            <Button
              variant="ghost"
              onClick={() => setShowDatePicker(true)}
              className="text-sm sm:text-lg font-semibold text-gray-900 hover:bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 h-9 sm:h-10"
            >
              <span className="hidden sm:inline">
                {format(currentWeekStart, 'MMM d')} -{' '}
                {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
              </span>
              <span className="sm:hidden">
                {format(currentWeekStart, 'MMM d')} -{' '}
                {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd')}
              </span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {getWeekDays().map((date) => {
              const daySlots = getSlotsForDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasSlots = daySlots.length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] relative ${
                    isSelected
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {format(date, 'EEE')}
                  </div>
                  <div
                    className={`text-sm sm:text-lg font-semibold ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {format(date, 'd')}
                  </div>
                  {/* Slot indicator dot */}
                  {hasSlots && (
                    <div className="flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                  {/* Empty space to maintain consistent height */}
                  {!hasSlots && <div className="mt-1 h-2"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {selectedDateSlots.length} slot{selectedDateSlots.length !== 1 ? 's' : ''} for this
              day
            </p>
          </div>

          {/* Create Slots Button */}
          {selectedDateSlots.length !== 0 && (
            <Button
              onClick={() => setShowCreateSlotForm(true)}
              disabled={isCreating}
              className="flex items-center gap-2 w-full sm:w-auto h-10 sm:h-10"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Creating...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Slots</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Slots List for Selected Date */}
        {isLoading && slots.length === 0 ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedDateSlots.length === 0 ? (
          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No time slots for this day
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                No slots scheduled for {format(selectedDate, 'MMMM d, yyyy')}.
              </p>
              <Button onClick={() => setShowCreateSlotForm(true)} className="w-full sm:w-auto h-10">
                <Plus className="h-4 w-4 mr-2" />
                Create Slots for This Day
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDateSlots.map((slot) => {
              const slotDate = new Date(slot.startTime);

              return (
                <Card
                  key={slot.id}
                  className="border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Time Column */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-center min-w-[80px] gap-2 sm:gap-0">
                        <div className="text-sm font-medium text-gray-900">
                          {format(slotDate, 'HH:mm')}
                        </div>
                        <div className="text-xs text-gray-500">{slot.duration}min</div>
                      </div>

                      {/* Location Column */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {getLocationTypeLabel(slot.locationType)}
                          </span>
                          {slot.status === 'RESERVED' && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              Reserved
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.notes || `${slot.duration} minute session`}
                        </div>
                      </div>

                      {/* Status & Actions Column */}
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(slot.status)} bg-opacity-10`}
                        >
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1).toLowerCase()}
                        </span>

                        {/* Action Button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                              <span className="hidden sm:inline">Edit</span>
                              <span className="sm:hidden">...</span>
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit slot
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Change location
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="h-4 w-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete slot
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-sm mx-4 sm:mx-0">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Create Time Slots</DialogTitle>
            <DialogDescription>
              Set up your availability for client appointments. You can create multiple slots at
              once.
            </DialogDescription>
          </DialogHeader>
          <CreateSlotForm onSuccess={handleSlotCreateSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Slot Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Delete Time Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Slot
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Delete Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
