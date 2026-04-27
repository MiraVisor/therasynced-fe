'use client';

import { format } from 'date-fns';
import { Calendar, DateLocalizer, View } from 'react-big-calendar';

import { Slot } from '@/types/types';

interface CalendarSlot extends Omit<Slot, 'startTime' | 'endTime'> {
  start: Date;
  end: Date;
}

interface SlotCalendarWrapperProps {
  localizer: DateLocalizer;
  slots: CalendarSlot[];
  view: View;
  date: Date;
  onView: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectSlot: (slot: CalendarSlot) => void;
}

const eventStyleGetter = (slot: CalendarSlot) => {
  let backgroundColor = '#3174ad';
  let borderColor = '#265985';

  switch (slot.status) {
    case 'BOOKED':
      backgroundColor = '#ef4444';
      borderColor = '#dc2626';
      break;
    case 'RESERVED':
      backgroundColor = '#f59e0b';
      borderColor = '#d97706';
      break;
    case 'AVAILABLE':
      backgroundColor = '#10b981';
      borderColor = '#059669';
      break;
    case 'CANCELLED':
      backgroundColor = '#6b7280';
      borderColor = '#4b5563';
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
      fontSize: '12px',
    },
  };
};

export const SlotCalendarWrapper = ({
  localizer,
  slots,
  view,
  date,
  onView,
  onNavigate,
  onSelectSlot,
}: SlotCalendarWrapperProps) => {
  return (
    <Calendar
      localizer={localizer}
      events={slots}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '600px' }}
      view={view}
      date={date}
      onView={onView}
      onNavigate={onNavigate}
      onSelectEvent={onSelectSlot}
      min={new Date(0, 0, 0, 6, 0, 0)}
      max={new Date(0, 0, 0, 23, 0, 0)}
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
