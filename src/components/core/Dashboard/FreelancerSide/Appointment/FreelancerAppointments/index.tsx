'use client';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { View, dateFnsLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { updateAppointment } from '@/redux/slices/appointmentSlice';
import {
  navigateToNext,
  navigateToPrev,
  navigateToToday,
  setCalendarView,
  setSelectedDate,
} from '@/redux/slices/calendarSlice';
import { RootState } from '@/redux/store';
import { Appointment } from '@/types/types';

import { CalendarToolbar } from '../CalendarToolbar';
import { CalendarWrapper } from './CalendarWrapper';
import { EventDialog } from './EventDialog';
import { ListView } from './ListView';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface FreelancerAppointmentsProps {
  onSelectEvent: (event: Appointment) => void;
}

interface CalendarEvent extends Omit<Appointment, 'start' | 'end'> {
  start: Date;
  end: Date;
}

interface CalendarFilters {
  hideCompleted: boolean;
  hideCancelled: boolean;
  showOnlyUpcoming: boolean;
  showOnlyPast: boolean;
}

// Mock server update function

const FreelancerAppointments = ({ onSelectEvent }: FreelancerAppointmentsProps) => {
  const dispatch = useDispatch();
  const { appointments } = useSelector((state: RootState) => state.appoinment);
  const { calendarView, selectedDate } = useSelector((state: RootState) => state.calendar);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [filters, setFilters] = useState<CalendarFilters>({
    hideCompleted: false,
    hideCancelled: false,
    showOnlyUpcoming: false,
    showOnlyPast: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const serverSaveToastRef = useRef<{ id: string | number } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    const appointment: Appointment = {
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    };
    setSelectedEvent(appointment);
    onSelectEvent(appointment);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };

      // Handle mutually exclusive filters
      if (newFilters.showOnlyUpcoming && updated.showOnlyPast) {
        updated.showOnlyPast = false;
      }
      if (newFilters.showOnlyPast && updated.showOnlyUpcoming) {
        updated.showOnlyUpcoming = false;
      }

      return updated;
    });
  };

  const handleNavigateAction = (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => {
    switch (action) {
      case 'PREV':
        dispatch(navigateToPrev());
        break;
      case 'NEXT':
        dispatch(navigateToNext());
        break;
      case 'TODAY':
        dispatch(navigateToToday());
        break;
      case 'DATE':
        if (date) {
          dispatch(setSelectedDate(date));
        }
        break;
    }
  };

  const updateNotesOnServer = async (appointmentId: string, notes: string) => {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notes');
    }

    return response.json();
  };

  const handleDialogClose = async () => {
    if (!selectedEvent) return;

    // If user is typing, wait for the current save to complete
    if (isTyping) {
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Wait for typing to finish and last save to complete
      await new Promise((resolve) => {
        typingTimeoutRef.current = setTimeout(resolve, 1500);
      });
    }

    const currentAppointment = appointments.find((apt) => apt.id === selectedEvent.id);
    if (!currentAppointment) return;

    // Get the latest notes from Redux store
    const latestAppointment = appointments.find((apt) => apt.id === selectedEvent.id);
    if (!latestAppointment) return;

    const hasChanges = (currentAppointment.notes || '') !== (latestAppointment.notes || '');
    if (!hasChanges) {
      setSelectedEvent(null);
      return;
    }

    // Clear any existing server save toast
    if (serverSaveToastRef.current) {
      toast.dismiss(serverSaveToastRef.current.id);
    }

    // Show server save toast
    const toastId = toast.loading('Saving changes to server...', {
      position: 'bottom-right',
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    serverSaveToastRef.current = { id: toastId };

    try {
      // Save to server using the latest notes from Redux
      await updateNotesOnServer(selectedEvent.id, latestAppointment.notes || '');

      if (serverSaveToastRef.current) {
        toast.update(serverSaveToastRef.current.id, {
          render: 'Changes saved to server successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
          closeOnClick: true,
        });
        serverSaveToastRef.current = null;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving notes:', error);

      // Revert Redux state on error
      dispatch(updateAppointment({ ...currentAppointment, notes: currentAppointment.notes || '' }));

      if (serverSaveToastRef.current) {
        toast.update(serverSaveToastRef.current.id, {
          render: 'Failed to save changes to server. Please try again.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
        serverSaveToastRef.current = null;
      }
    } finally {
      setSelectedEvent(null);
      setIsTyping(false);
    }
  };

  // Convert ISO strings to Date objects for the calendar
  const calendarEvents = appointments
    .filter((event) => {
      // Filter by status
      if (filters.hideCompleted && event.status === 'COMPLETED') return false;
      if (filters.hideCancelled && event.status === 'CANCELLED') return false;

      // Filter by date
      const now = new Date();
      if (filters.showOnlyUpcoming && new Date(event.start) < now) return false;
      if (filters.showOnlyPast && new Date(event.start) >= now) return false;

      return true;
    })
    .map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <div className="flex-none">
          <CalendarToolbar
            view={calendarView}
            onView={(newView: View) => dispatch(setCalendarView(newView))}
            onNavigate={handleNavigateAction}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="flex-1">
          {isMobile ? (
            <ListView
              events={appointments.filter((event) => {
                // Filter by status
                if (filters.hideCompleted && event.status === 'COMPLETED') return false;
                if (filters.hideCancelled && event.status === 'CANCELLED') return false;

                // Filter by date
                const now = new Date();
                if (filters.showOnlyUpcoming && new Date(event.start) < now) return false;
                if (filters.showOnlyPast && new Date(event.start) >= now) return false;

                return true;
              })}
              onSelectEvent={(event) => {
                const calendarEvent: CalendarEvent = {
                  ...event,
                  start: new Date(event.start),
                  end: new Date(event.end),
                };
                handleSelectEvent(calendarEvent);
              }}
              view={calendarView}
              selectedDate={selectedDate}
            />
          ) : (
            <CalendarWrapper
              localizer={localizer}
              events={calendarEvents}
              view={calendarView}
              date={selectedDate}
              onView={(newView: View) => dispatch(setCalendarView(newView))}
              onNavigate={(date: Date) => dispatch(setSelectedDate(date))}
              onSelectEvent={handleSelectEvent}
              filters={filters}
              onFilterChange={handleFilterChange}
              onNavigateAction={handleNavigateAction}
            />
          )}
        </div>
      </div>
      {selectedEvent && (
        <EventDialog
          selectedEvent={selectedEvent}
          onClose={handleDialogClose}
          onTypingChange={setIsTyping}
        />
      )}
    </div>
  );
};

export default FreelancerAppointments;
