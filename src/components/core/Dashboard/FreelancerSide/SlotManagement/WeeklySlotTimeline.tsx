import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { Slot } from '@/types/types';

interface WeeklySlotTimelineProps {
  slots: Slot[];
  weekStart: Date;
  onDayClick?: (date: Date) => void;
  selectedDate?: Date;
}

export const WeeklySlotTimeline = ({
  slots,
  weekStart,
  onDayClick,
  selectedDate,
}: WeeklySlotTimelineProps) => {
  const weekDays = useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart]);

  const getSlotsForDate = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, date);
    });
  };

  const getStatsForDay = (date: Date) => {
    const daySlots = getSlotsForDate(date);
    const booked = daySlots.filter((s) => s.status === 'BOOKED').length;
    const available = daySlots.filter((s) => s.status === 'AVAILABLE').length;
    const total = daySlots.length;
    const maxSlots = Math.max(...weekDays.map((day) => getSlotsForDate(day).length), 1);

    return { booked, available, total, maxSlots };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4 lg:mb-6">
        <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
          <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
        </div>
        <h3 className="font-poppins text-base lg:text-lg font-semibold text-charcoal">
          Weekly Overview
        </h3>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {weekDays.map((date, index) => {
          const stats = getStatsForDay(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => onDayClick?.(date)}
                  className={cn(
                    'flex items-center gap-3 text-left flex-1',
                    'hover:opacity-70 transition-opacity',
                  )}
                >
                  <div className="text-sm font-poppins font-medium text-muted-foreground min-w-[60px]">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-sm font-inter text-charcoal min-w-[80px]">
                    {format(date, 'MMM d')}
                  </div>
                  {isToday && (
                    <span className="text-xs font-inter font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs font-inter text-muted-foreground">
                  {stats.total > 0 && (
                    <>
                      <span className="text-success font-medium">{stats.booked}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-info font-medium">{stats.available}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1 h-8 bg-gray-100 rounded-xl p-1">
                {stats.booked > 0 && (
                  <div
                    className="bg-success rounded-lg transition-all duration-300"
                    style={{
                      width: `${(stats.booked / stats.maxSlots) * 100}%`,
                    }}
                    title={`${stats.booked} booked`}
                  />
                )}
                {stats.available > 0 && (
                  <div
                    className="bg-info rounded-lg transition-all duration-300"
                    style={{
                      width: `${(stats.available / stats.maxSlots) * 100}%`,
                    }}
                    title={`${stats.available} available`}
                  />
                )}
                {stats.total === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs font-inter text-muted-foreground">No slots</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success rounded"></div>
          <span className="text-xs font-inter text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-info rounded"></div>
          <span className="text-xs font-inter text-muted-foreground">Available</span>
        </div>
      </div>
    </div>
  );
};
