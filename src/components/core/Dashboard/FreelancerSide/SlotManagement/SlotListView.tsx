'use client';

import { endOfWeek, format, isSameDay, isSameMonth, startOfWeek } from 'date-fns';
import { Calendar, ChevronRight, Clock, Euro, MapPin } from 'lucide-react';
import { View } from 'react-big-calendar';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slot } from '@/types/types';

interface SlotListViewProps {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
  view: View;
  selectedDate: Date;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'BOOKED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'RESERVED':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getLocationTypeIcon = (type: string | undefined | null) => {
  if (!type) return '📍';

  switch (type) {
    case 'VIRTUAL':
      return '💻';
    case 'HOME':
      return '🏠';
    case 'OFFICE':
      return '🏢';
    case 'CLINIC':
      return '🏥';
    default:
      return '📍';
  }
};

const getLocationTypeLabel = (type: string | undefined | null) => {
  if (!type) return '';

  switch (type) {
    case 'VIRTUAL':
      return 'Virtual';
    case 'HOME':
      return 'Home Visit';
    case 'OFFICE':
      return 'Office';
    case 'CLINIC':
      return 'Clinic';
    default:
      return type;
  }
};

const filterSlotsByView = (slots: Slot[], view: View, selectedDate: Date) => {
  return slots.filter((slot) => {
    const slotDate = new Date(slot.startTime);
    switch (view) {
      case 'month':
        return isSameMonth(slotDate, selectedDate);
      case 'week': {
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return slotDate >= weekStart && slotDate <= weekEnd;
      }
      case 'day':
        return isSameDay(slotDate, selectedDate);
      default:
        return true;
    }
  });
};

export const SlotListView = ({ slots, onSelectSlot, view, selectedDate }: SlotListViewProps) => {
  const filteredSlots = filterSlotsByView(slots, view, selectedDate);

  return (
    <ScrollArea className="h-[600px]">
      <div className="flex flex-col gap-3 p-4">
        {filteredSlots.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No slots found for this {view}
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <Card
              key={slot.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelectSlot(slot)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header with Date and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getLocationTypeIcon(slot.locationType)}</span>
                        <h3 className="font-semibold">
                          {format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')}
                        </h3>
                      </div>
                      <div className="mt-1">
                        <Badge className={getStatusColor(slot.status)}>{slot.status}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Time and Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(slot.startTime), 'h:mm a')} -{' '}
                        {format(new Date(slot.endTime), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span>€{slot.basePrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocationTypeLabel(slot.locationType)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{slot.duration} min</span>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {slot.notes && (
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{slot.notes}</p>
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
