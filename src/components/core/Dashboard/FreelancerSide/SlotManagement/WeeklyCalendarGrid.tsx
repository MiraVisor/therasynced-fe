'use client';

import { addDays, format, isSameDay } from 'date-fns';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/types';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  slots: Slot[];
  isLoading?: boolean;
}

export const WeeklyCalendarGrid = ({
  weekStart,
  slots,
  isLoading = false,
}: WeeklyCalendarGridProps) => {
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  const slotsByDay = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = slots.filter((slot) => {
        const slotDate = new Date(slot.startTime);
        return isSameDay(slotDate, day);
      });
    });
    return grouped;
  }, [slots, weekDays]);

  const getTimeDisplay = (slot: Slot) => {
    const start = new Date(slot.startTime);
    return format(start, 'h:mma').toLowerCase();
  };

  const getSlotStatusColor = (status: string, hasBooking: boolean) => {
    if (hasBooking && status === 'BOOKED') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'BOOKED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="space-y-2">
            <div className="text-center py-2 border-b">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto mt-1" />
            </div>
            <div className="space-y-1 min-h-[100px]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const daySlots = slotsByDay[dayKey] || [];
        const isToday = isSameDay(day, new Date());
        const availableCount = daySlots.filter((s) => s.status === 'AVAILABLE').length;
        const bookedCount = daySlots.filter((s) => s.status === 'BOOKED').length;

        return (
          <div
            key={dayKey}
            className={cn(
              'border rounded-lg overflow-hidden',
              isToday ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200',
            )}
          >
            {/* Day Header */}
            <div
              className={cn('text-center py-2 border-b', isToday ? 'bg-primary/10' : 'bg-gray-50')}
            >
              <div className="text-xs font-medium text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </div>
              <div
                className={cn('text-lg font-semibold', isToday ? 'text-primary' : 'text-charcoal')}
              >
                {format(day, 'd')}
              </div>
            </div>

            {/* Slots Container */}
            <div className="p-1.5 min-h-[120px] max-h-[200px] overflow-y-auto space-y-1">
              {daySlots.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  No slots
                </div>
              ) : (
                daySlots.slice(0, 8).map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      'text-xs px-1.5 py-1 rounded border truncate',
                      getSlotStatusColor(slot.status, !!slot.booking),
                    )}
                    title={`${getTimeDisplay(slot)} - ${slot.status}${slot.booking ? ` (${slot.booking.client.name})` : ''}`}
                  >
                    {getTimeDisplay(slot)}
                  </div>
                ))
              )}
              {daySlots.length > 8 && (
                <div className="text-xs text-center text-gray-500">+{daySlots.length - 8} more</div>
              )}
            </div>

            {/* Day Summary */}
            {daySlots.length > 0 && (
              <div className="px-1.5 py-1 border-t bg-gray-50 flex items-center justify-center gap-1">
                {availableCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200"
                  >
                    {availableCount}
                  </Badge>
                )}
                {bookedCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {bookedCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
