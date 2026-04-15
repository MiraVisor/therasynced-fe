'use client';

import { addDays, format, isSameDay } from 'date-fns';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { Slot } from '@/types/types';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  slots: Slot[];
  isLoading?: boolean;
}

const formatTime = (iso: string) => format(new Date(iso), 'h:mma').toLowerCase();

export const WeeklyCalendarGrid = ({
  weekStart,
  slots,
  isLoading = false,
}: WeeklyCalendarGridProps) => {
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  const slotsByDay = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = slots
        .filter((slot) => isSameDay(new Date(slot.startTime), day))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });
    return grouped;
  }, [slots, weekDays]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 min-h-[168px]"
          >
            <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-7 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-1.5 w-full bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-inter">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Available
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const daySlots = slotsByDay[dayKey] ?? [];
          const isToday = isSameDay(day, new Date());

          const activeSlots = daySlots.filter((s) => s.status !== 'CANCELLED');
          const totalCount = activeSlots.length;
          const bookedCount = activeSlots.filter(
            (s) => s.status === 'BOOKED' || s.status === 'RESERVED',
          ).length;
          const availableCount = activeSlots.filter((s) => s.status === 'AVAILABLE').length;
          const bookedPct = totalCount > 0 ? (bookedCount / totalCount) * 100 : 0;
          const availablePct = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;

          const firstSlot = activeSlots[0];
          const lastSlot = activeSlots[activeSlots.length - 1];
          const timeRange =
            firstSlot && lastSlot
              ? `${formatTime(firstSlot.startTime)} – ${formatTime(lastSlot.endTime)}`
              : null;

          return (
            <div
              key={dayKey}
              className={cn(
                'rounded-xl border p-4 flex flex-col gap-3 min-h-[168px] transition',
                isToday
                  ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              {/* Day header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground font-inter">
                    {format(day, 'EEE')}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold font-poppins leading-tight',
                      isToday ? 'text-primary' : 'text-charcoal',
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
                {isToday && (
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Today
                  </span>
                )}
              </div>

              {/* Body */}
              {totalCount === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-gray-400 italic font-inter">No slots</p>
                </div>
              ) : (
                <>
                  {/* Slot count */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-charcoal font-poppins leading-none">
                      {totalCount}
                    </span>
                    <span className="text-xs text-muted-foreground font-inter">
                      {totalCount === 1 ? 'slot' : 'slots'}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="space-y-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex"
                      role="img"
                      aria-label={`${bookedCount} booked, ${availableCount} available`}
                    >
                      {bookedPct > 0 && (
                        <div className="bg-blue-500 h-full" style={{ width: `${bookedPct}%` }} />
                      )}
                      {availablePct > 0 && (
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${availablePct}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-inter">
                      <span className="text-blue-600 font-semibold">{bookedCount} booked</span>
                      <span className="text-green-600 font-semibold">{availableCount} free</span>
                    </div>
                  </div>

                  {/* Time range */}
                  {timeRange && (
                    <p className="text-[10px] text-muted-foreground font-inter mt-auto">
                      {timeRange}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
