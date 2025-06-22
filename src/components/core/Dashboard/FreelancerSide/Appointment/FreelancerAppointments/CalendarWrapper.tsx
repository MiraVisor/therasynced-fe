'use client';

import { format } from 'date-fns';
import { Calendar, DateLocalizer, View } from 'react-big-calendar';
import { useDispatch } from 'react-redux';

import { setCalendarView, setSelectedDate } from '@/redux/slices/calendarSlice';
import { Appointment } from '@/types/types';

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

interface CalendarWrapperProps {
  localizer: DateLocalizer;
  events: CalendarEvent[];
  view: View;
  date: Date;
  onView: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  filters: CalendarFilters;
  onFilterChange: (filters: Partial<CalendarFilters>) => void;
  onNavigateAction: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => void;
}

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '#3174ad';
  let borderColor = '#265985';

  switch (event.status) {
    case 'COMPLETED':
      backgroundColor = '#10b981';
      borderColor = '#059669';
      break;
    case 'CANCELLED':
      backgroundColor = '#ef4444';
      borderColor = '#dc2626';
      break;
    case 'PENDING':
      backgroundColor = '#f59e0b';
      borderColor = '#d97706';
      break;
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  };
};

export const CalendarWrapper = ({
  localizer,
  events,
  view,
  date,
  onView,
  onNavigate,
  onSelectEvent,
}: CalendarWrapperProps) => {
  const dispatch = useDispatch();

  const handleViewChange = (newView: View) => {
    dispatch(setCalendarView(newView));
    onView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    dispatch(setSelectedDate(newDate));
    onNavigate(newDate);
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '90%' }}
      view={view}
      date={date}
      onView={handleViewChange}
      onNavigate={handleNavigate}
      onSelectEvent={onSelectEvent}
      min={new Date(0, 0, 0, 8, 0, 0)}
      max={new Date(0, 0, 0, 22, 0, 0)}
      step={30}
      timeslots={1}
      defaultView="week"
      views={['month', 'week', 'day']}
      formats={{
        timeGutterFormat: (date: Date) => format(date, 'h:mm a'),
        eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
          `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
      }}
      dayLayoutAlgorithm="no-overlap"
      popup
      selectable
      onSelectSlot={() => {}}
      eventPropGetter={eventStyleGetter}
      components={{
        toolbar: () => null,
      }}
    />
  );
};
