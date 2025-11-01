import { format, isToday } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Slot } from '@/types/types';

import { SlotCard } from './SlotCard';

interface DaySlotSectionProps {
  date: Date;
  slots: Slot[];
  onSlotClick?: (slot: Slot) => void;
}

export const DaySlotSection = ({ date, slots, onSlotClick }: DaySlotSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isCurrentDay = isToday(date);
  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const bookedCount = slots.filter((s) => s.status === 'BOOKED').length;
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 lg:p-6 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4 flex-1 text-left">
            <div
              className={cn(
                'p-2 lg:p-3 rounded-xl',
                isCurrentDay ? 'bg-primary/10' : 'bg-gray-100',
              )}
            >
              <Calendar
                className={cn(
                  'h-4 w-4 lg:h-5 lg:w-5',
                  isCurrentDay ? 'text-primary' : 'text-muted-foreground',
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'font-poppins font-semibold text-base lg:text-lg',
                    isCurrentDay ? 'text-primary' : 'text-charcoal',
                  )}
                >
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </h3>
                {isCurrentDay && (
                  <span className="text-xs font-inter font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <p className="font-inter text-sm text-muted-foreground mt-1">
                {slots.length} slot{slots.length !== 1 ? 's' : ''} scheduled
                {slots.length > 0 && (
                  <>
                    {' '}
                    · <span className="text-success">{bookedCount} booked</span> ·{' '}
                    <span className="text-info">{availableCount} available</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isExpanded && 'transform rotate-180',
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {slots.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
              </div>
              <h4 className="font-poppins text-base lg:text-lg font-semibold text-charcoal mb-2">
                No slots for this day
              </h4>
              <p className="font-inter text-sm lg:text-base text-muted-foreground">
                You haven&apos;t scheduled any time slots for {format(date, 'MMMM d, yyyy')}.
              </p>
            </div>
          ) : (
            <div className="p-4 lg:p-6 space-y-3">
              {sortedSlots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} onClick={() => onSlotClick?.(slot)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
