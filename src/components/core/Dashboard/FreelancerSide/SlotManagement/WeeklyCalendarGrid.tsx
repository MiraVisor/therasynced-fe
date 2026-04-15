'use client';

import { addDays, format, isSameDay } from 'date-fns';
import { Clock } from 'lucide-react';
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
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 min-h-[200px]"
          >
            <div className="space-y-2">
              <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
            <div className="h-2.5 w-full bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                'rounded-xl border p-4 flex flex-col min-h-[200px] transition-all duration-200',
                isToday
                  ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-primary/20 shadow-sm'
                  : 'border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5',
              )}
            >
              {/* Date cluster */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold tracking-[0.14em] text-muted-foreground font-inter">
                    {format(day, 'EEE')}
                  </p>
                  <p
                    className={cn(
                      'text-4xl font-bold font-poppins leading-none',
                      isToday ? 'text-primary' : 'text-charcoal',
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
                {isToday && (
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              {/* Body */}
              {totalCount === 0 ? (
                <div className="flex-1 flex items-center justify-center border-t border-dashed border-gray-200 -mx-4 px-4 pt-4">
                  <p className="text-xs text-gray-400 italic font-inter">No slots</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 flex-1">
                  {/* Total as supporting meta */}
                  <p className="text-[11px] font-medium text-muted-foreground font-inter uppercase tracking-wide">
                    {totalCount} {totalCount === 1 ? 'slot' : 'slots'}
                  </p>

                  {/* Capacity bar */}
                  <div
                    className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex"
                    role="img"
                    aria-label={`${bookedCount} booked, ${availableCount} available`}
                  >
                    {bookedPct > 0 && (
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{ width: `${bookedPct}%` }}
                      />
                    )}
                    {availablePct > 0 && (
                      <div
                        className="bg-green-500 h-full transition-all"
                        style={{ width: `${availablePct}%` }}
                      />
                    )}
                  </div>

                  {/* Booked / Free counts — promoted */}
                  <div className="flex items-center justify-between text-xs font-inter">
                    <span className="flex items-baseline gap-1">
                      <span className="font-bold text-blue-600 text-sm tabular-nums">
                        {bookedCount}
                      </span>
                      <span className="text-blue-600/80">booked</span>
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="font-bold text-green-600 text-sm tabular-nums">
                        {availableCount}
                      </span>
                      <span className="text-green-600/80">free</span>
                    </span>
                  </div>

                  {/* Time range footer */}
                  {timeRange && (
                    <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-inter border-t border-gray-100 -mx-4 px-4">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{timeRange}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
