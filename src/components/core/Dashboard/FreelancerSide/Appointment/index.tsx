'use client';

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  cancelAppointment,
  fetchFreelancerAppointmentsByDate,
  updateAppointmentNotes,
} from '@/redux/slices/appointmentSlice';
import { RootState } from '@/redux/store';
import { Appointment, LocationType } from '@/types/types';

// Generate time slots from 7am to 7pm
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const startTime = format(new Date().setHours(hour, minute, 0, 0), 'h:mm a');
      const endTime = format(new Date().setHours(hour, minute + 15, 0, 0), 'h:mm a');
      slots.push({
        start: startTime,
        end: endTime,
        hour,
        minute,
        displayTime: minute === 0 ? format(new Date().setHours(hour, 0, 0, 0), 'ha') : '', // Only show hour label at the start of each hour
      });
    }
  }
  console.log('Generated time slots:', slots); // Debug log
  return slots;
};

const timeSlots = generateTimeSlots();

// Color palette for appointment slots

// Function to get random color for appointment

// Function to get distinct colors for multiple appointments
const getDistinctColors = (count: number) => {
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#8B5CF6', // purple-500
    '#F59E0B', // orange-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#EF4444', // red-500
    '#EAB308', // yellow-500
    '#06B6D4', // cyan-500
  ];

  return colors.slice(0, count);
};

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, isLoading } = useSelector((state: RootState) => state.appoinment);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); // Reset to current date
  const [viewType, setViewType] = useState<'day' | 'month'>('day');
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [, setIsMobile] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string>('');

  useEffect(() => {
    loadAppointments(); // Restore API call
    checkMobile();
    window.addEventListener('resize', checkMobile);
    console.log(
      'Time slots generated:',
      timeSlots.length,
      'slots from',
      timeSlots[0]?.start,
      'to',
      timeSlots[timeSlots.length - 1]?.start,
    );
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update editing notes when selected appointment changes
  useEffect(() => {
    if (selectedAppointment) {
      setEditingNotes(selectedAppointment.notes || '');
    }
  }, [selectedAppointment]);

  const handleNotesChange = (value: string) => {
    setEditingNotes(value);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      // Dispatch the async thunk to update notes via API
      await dispatch(
        updateAppointmentNotes({
          appointmentId: selectedAppointment.id,
          notes: editingNotes,
        }) as any,
      ).unwrap();

      // Update the local appointment state
      const updatedAppointment = {
        ...selectedAppointment,
        notes: editingNotes,
      };
      setSelectedAppointment(updatedAppointment);

      toast.success('Notes updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notes');
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const loadAppointments = () => {
    dispatch(fetchFreelancerAppointmentsByDate(format(currentDate, 'yyyy-MM-dd')) as any); // Restore API call
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await dispatch(
        cancelAppointment({
          bookingId: selectedAppointment.id,
          reason: cancelReason,
        }) as any,
      ).unwrap();
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.start);
        return isSameDay(aptDate, date);
      })
      .sort((a, b) => {
        const aStart = new Date(a.start);
        const bStart = new Date(b.start);
        return aStart.getTime() - bStart.getTime();
      });
  };

  const getAppointmentTimeRange = (appointment: Appointment) => {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    return `${format(start, 'h:mm a').toUpperCase()} - ${format(end, 'h:mm a').toUpperCase()}`;
  };

  const shouldShowAppointmentInTimeSlot = (appointment: Appointment, timeSlot: string) => {
    const start = new Date(appointment.start);
    const appointmentStartHour = start.getHours();
    const appointmentStartMinutes = start.getMinutes();

    // Parse the time slot (e.g., "9:15 am" -> 9:15)
    const timeSlotParts = timeSlot.split(':');
    const slotHour = parseInt(timeSlotParts[0]);
    const slotMinutes = parseInt(timeSlotParts[1]?.split(' ')[0]) || 0;
    const isPM = timeSlot.toLowerCase().includes('pm') && slotHour !== 12;
    const adjustedSlotHour = isPM ? slotHour + 12 : slotHour === 12 ? 12 : slotHour;

    // Convert appointment start time to minutes for comparison
    const appointmentStartTotalMinutes = appointmentStartHour * 60 + appointmentStartMinutes;
    const slotStartTotalMinutes = adjustedSlotHour * 60 + slotMinutes;
    const slotEndTotalMinutes = slotStartTotalMinutes + 15; // 15-minute slot

    // Show appointment only in the slot where it starts
    return (
      appointmentStartTotalMinutes >= slotStartTotalMinutes &&
      appointmentStartTotalMinutes < slotEndTotalMinutes
    );
  };

  // Get appointments for a specific time slot and calculate their positions
  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    const slotAppointments = getDayAppointments().filter((appointment) =>
      shouldShowAppointmentInTimeSlot(appointment, timeSlot),
    );

    if (slotAppointments.length === 0) return [];

    const distinctColors = getDistinctColors(slotAppointments.length);

    return slotAppointments.map((appointment, index) => {
      // For overlapping appointments, use a fixed width and stack them
      const width = slotAppointments.length > 1 ? '90%' : '95%';
      const left = slotAppointments.length > 1 ? `${5 + index * 5}%` : '2.5%';

      // Calculate the exact start position within the time slot
      const appointmentStart = new Date(appointment.start);
      const appointmentStartMinutes = appointmentStart.getMinutes();
      const appointmentStartHour = appointmentStart.getHours();

      // Parse the time slot
      const timeSlotParts = timeSlot.split(':');
      const slotHour = parseInt(timeSlotParts[0]);
      const slotMinutes = parseInt(timeSlotParts[1]?.split(' ')[0]) || 0;
      const isPM = timeSlot.toLowerCase().includes('pm') && slotHour !== 12;
      const adjustedSlotHour = isPM ? slotHour + 12 : slotHour === 12 ? 12 : slotHour;

      // Calculate minutes offset within the 15-minute slot
      const appointmentTotalMinutes = appointmentStartHour * 60 + appointmentStartMinutes;
      const slotTotalMinutes = adjustedSlotHour * 60 + slotMinutes;
      const minutesOffset = appointmentTotalMinutes - slotTotalMinutes;
      const topPosition = Math.max(0, (minutesOffset / 15) * 25); // 25px per 15-minute interval

      // Calculate appointment duration in minutes
      const appointmentEnd = new Date(appointment.end);
      const appointmentEndHour = appointmentEnd.getHours();
      const appointmentEndMinutes = appointmentEnd.getMinutes();
      const appointmentEndTotalMinutes = appointmentEndHour * 60 + appointmentEndMinutes;
      const durationMinutes = appointmentEndTotalMinutes - appointmentTotalMinutes;
      const height = Math.max(25, (durationMinutes / 15) * 25); // Minimum 25px (one 15-min slot)

      return {
        appointment,
        width,
        left,
        top: `${topPosition}px`,
        height: `${height}px`,
        zIndex: slotAppointments.length - index, // Higher index gets higher z-index
        color: distinctColors[index],
        borderColor: distinctColors[index], // Use same color for border
      };
    });
  };

  const getDayAppointments = () => {
    return getAppointmentsForDate(currentDate);
  };

  const removeFilter = (filter: string) => {
    setAppliedFilters(appliedFilters.filter((f) => f !== filter));
  };

  // Calendar helpers
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getCalendarMonth = () => {
    return format(currentDate, 'MMMM yyyy');
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isDateSelected = (date: Date) => {
    return isSameDay(date, currentDate);
  };

  const hasAppointmentsOnDate = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  if (isLoading || appointments.length === 0) {
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
          <h2 className="text-2xl font-bold">Appointments</h2>
          <p className="text-gray-600">Manage your client appointments and bookings</p>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Main Content - Day View */}
        <div className="flex-1 flex flex-col order-2 lg:order-1">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            {/* Applied Filters */}
            <div className="flex items-center gap-2">
              {appliedFilters.length > 0 && (
                <>
                  <span className="text-sm text-gray-600">Applied Filters:</span>
                  {appliedFilters.map((filter) => (
                    <Badge key={filter} variant="secondary" className="gap-1">
                      Search: {filter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Day View */}
          <div className="flex-1 bg-white overflow-hidden">
            {/* Google Calendar Style Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {format(currentDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">
                      {getDayAppointments().length} appointment
                      {getDayAppointments().length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Today
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Calendar Style Time Grid */}
            <div className="flex-1 relative h-full">
              <div className="overflow-y-auto h-full pb-4">
                <div className="pt-14 pb-28 relative">
                  {timeSlots.map((time, index) => (
                    <div key={time.start} className="flex group" style={{ height: '25px' }}>
                      {/* Time Label - Google Calendar Style */}
                      <div className="w-16 text-xs text-gray-500 bg-white flex items-start justify-end pr-1 border-r border-gray-100">
                        <div
                          className={`text-gray-500 font-medium ${time.displayTime ? 'font-semibold' : 'opacity-0'}`}
                        >
                          {time.displayTime}
                        </div>
                      </div>

                      {/* Time Slot Area - Google Calendar Style */}
                      <div className="flex-1 relative bg-white hover:bg-gray-50 transition-colors duration-150">
                        {/* Grid line positioned at the same level as time label */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                        {/* Alternate row shading for better visual separation */}
                        {index % 2 === 0 && (
                          <div className="absolute inset-0 bg-gray-50/30 pointer-events-none"></div>
                        )}

                        {/* Appointment Blocks - Google Calendar Style */}
                        {getAppointmentsForTimeSlot(time.start).map((appointmentSlot) => (
                          <div
                            key={appointmentSlot.appointment.id}
                            className="absolute text-white rounded-lg p-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm"
                            style={{
                              left: appointmentSlot.left,
                              width: appointmentSlot.width,
                              top: appointmentSlot.top,
                              height: appointmentSlot.height,
                              minHeight: '25px',
                              backgroundColor: appointmentSlot.color,
                              zIndex: appointmentSlot.zIndex,
                              margin: '0 2px',
                              boxShadow:
                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            }}
                            onClick={() => setSelectedAppointment(appointmentSlot.appointment)}
                          >
                            <div className="flex flex-col h-full justify-start">
                              <div className="text-xs font-medium leading-tight mb-1 truncate">
                                {appointmentSlot.appointment.title}
                              </div>
                              <div className="text-xs leading-tight">
                                {getAppointmentTimeRange(appointmentSlot.appointment)}
                              </div>
                              {appointmentSlot.appointment.location && (
                                <div className="text-xs leading-tight truncate mt-1">
                                  {appointmentSlot.appointment.location === LocationType.CLINIC
                                    ? 'Clinic'
                                    : appointmentSlot.appointment.location === LocationType.OFFICE
                                      ? 'Office'
                                      : appointmentSlot.appointment.location ===
                                          LocationType.VIRTUAL
                                        ? 'Virtual'
                                        : 'Home'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Calendar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 order-1 lg:order-2">
          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-xl font-bold text-gray-900">{getCalendarMonth()}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-3">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 font-semibold">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((date, index) => {
                  const isCurrentMonth = isSameMonth(date, currentDate);
                  const isCurrentDay = isToday(date);
                  const isSelected = isDateSelected(date);
                  const hasAppointments = hasAppointmentsOnDate(date);

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentDate(date)}
                      className={`
                        aspect-square text-sm rounded-xl flex items-center justify-center relative
                        transition-all duration-200 ease-in-out font-medium
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isCurrentDay ? 'bg-blue-600 text-white shadow-lg scale-110 font-bold' : ''}
                        ${isSelected && !isCurrentDay ? 'bg-blue-200 text-blue-700 font-semibold shadow-md' : ''}
                        ${hasAppointments && !isCurrentDay && !isSelected ? 'bg-blue-50 border-2 border-blue-200' : ''}
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                        hover:bg-gray-100 hover:scale-105 hover:shadow-md
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        active:scale-95
                      `}
                    >
                      {getDate(date)}
                      {hasAppointments && (
                        <div className="absolute bottom-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointments List - Hidden on Mobile */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-3 flex-1 shadow-sm">
            <div className="flex items-center gap-3 mb-4 px-3">
              <h3 className="text-lg font-bold text-gray-900">APPOINTMENTS</h3>
            </div>
            <div className="space-y-3">
              {getDayAppointments().map((appointment) => {
                return (
                  <div
                    key={appointment.id}
                    className="text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="text-xs font-medium leading-tight mb-1 text-gray-900">
                      {appointment.title}
                    </div>
                    <div className="text-xs leading-tight text-gray-600">
                      {getAppointmentTimeRange(appointment)}
                    </div>
                    {appointment.location && (
                      <div className="text-xs leading-tight truncate mt-1 text-gray-500">
                        {appointment.location === LocationType.CLINIC
                          ? 'Clinic'
                          : appointment.location === LocationType.OFFICE
                            ? 'Office'
                            : appointment.location === LocationType.VIRTUAL
                              ? 'Virtual'
                              : 'Home'}
                      </div>
                    )}
                  </div>
                );
              })}
              {getDayAppointments().length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No appointments for this day</p>
                  <p className="text-sm text-gray-400 mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {/* {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      )} */}

      {/* Appointment Detail Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Appointment Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Client Information */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                    {selectedAppointment.clientName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0">
                  <div>
                    <p className="text-gray-900 font-bold text-lg">
                      {selectedAppointment.clientName}
                    </p>
                    <p className="text-gray-600 text-sm">Client Email</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="">
                <div className="grid grid-cols-1 gap-4">
                  {/* Title */}
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Title</p>
                      <p className="text-sm text-gray-600">{selectedAppointment.title}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(selectedAppointment.start), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getAppointmentTimeRange(selectedAppointment)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {selectedAppointment.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">
                          {selectedAppointment.location === LocationType.CLINIC
                            ? 'Clinic'
                            : selectedAppointment.location === LocationType.OFFICE
                              ? 'Office'
                              : selectedAppointment.location === LocationType.VIRTUAL
                                ? 'Virtual'
                                : 'Home'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">Status</p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.status === 'CANCELLED'
                          ? 'Cancelled'
                          : selectedAppointment.status === 'PENDING'
                            ? 'Pending'
                            : 'Confirmed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-900">Notes</p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-0"
                        value={editingNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Enter notes..."
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        // className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex pt-4 border-t border-gray-200">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedAppointment(selectedAppointment);
                    setShowCancelDialog(true);
                  }}
                  className="flex-1 "
                >
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason for cancellation (optional)
              </label>
              <Textarea
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
};

export default Appointments;
