'use client';

import { endOfWeek, format, isSameDay, isSameMonth, startOfWeek } from 'date-fns';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Appointment, View } from '@/types/types';

interface ListViewProps {
  events: Appointment[];
  onSelectEvent: (event: Appointment) => void;
  view: View;
  selectedDate: Date;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'CANCELLED':
      return 'bg-red-500';
    case 'PENDING':
      return 'bg-yellow-500';
    default:
      return 'bg-blue-500';
  }
};

const filterEventsByView = (events: Appointment[], view: View, selectedDate: Date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.start);
    switch (view) {
      case 'month':
        return isSameMonth(eventDate, selectedDate);
      case 'week': {
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }
      case 'day':
        return isSameDay(eventDate, selectedDate);
      default:
        return true;
    }
  });
};

export const ListView = ({ events, onSelectEvent, view, selectedDate }: ListViewProps) => {
  const filteredEvents = filterEventsByView(events, view, selectedDate);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="flex flex-col gap-3 p-4">
        {filteredEvents.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No appointments found for this {view}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelectEvent(event)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                      <div className="mt-1">
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Date and Time */}
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span>{format(new Date(event.start), 'EEEE')}</span>
                        <span>{format(new Date(event.start), 'MMMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(event.start), 'h:mm a')} -{' '}
                        {format(new Date(event.end), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {event.notes && (
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{event.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
