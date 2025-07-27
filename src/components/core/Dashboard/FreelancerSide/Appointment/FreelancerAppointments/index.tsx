'use client';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState } from 'react';
import { View, dateFnsLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';

import { useMediaQuery } from '@/hooks/use-media-query';
import {
  navigateToNext,
  navigateToPrev,
  navigateToToday,
  setCalendarView,
  setFilters,
  setSelectedDate,
  setSelectedEvent,
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

const FreelancerAppointments = () => {
  const dispatch = useDispatch();
  const { selectedDate, calendarView, filters } = useSelector((state: RootState) => state.calendar);
  const appointments = useSelector((state: RootState) => state.appointment.appointments);
  const [, setIsTyping] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const handleSelectEvent = (event: CalendarEvent) => {
    const appointment: Appointment = {
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    };
    dispatch(setSelectedEvent(appointment));
  };

  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    dispatch(setFilters(newFilters));
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

  const calendarEvents = appointments
    .filter((event) => {
      if (filters.hideCompleted && event.status === 'COMPLETED') return false;
      if (filters.hideCancelled && event.status === 'CANCELLED') return false;

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
        <div className="flex-1 pb-12">
          {isMobile ? (
            <ListView
              events={appointments.filter((event) => {
                if (filters.hideCompleted && event.status === 'COMPLETED') return false;
                if (filters.hideCancelled && event.status === 'CANCELLED') return false;

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
      <EventDialog onTypingChange={setIsTyping} />
    </div>
  );
};

export default FreelancerAppointments;
