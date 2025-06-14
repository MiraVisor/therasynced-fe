'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-between items-center bg-primary text-white p-4 rounded-t-xl',
        caption_label: 'text-2xl font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-8 w-8 bg-transparent p-0 text-white hover:opacity-80 inline-flex items-center justify-center',
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex justify-between px-2 py-2',
        head_cell: 'text-muted-foreground w-10 font-medium text-sm',
        row: 'flex w-full justify-between px-2 mb-0',
        cell: 'relative p-0 text-center focus-within:relative focus-within:z-20',
        day: cn(
          'h-10 w-10 p-0 font-normal text-base hover:bg-green-50 rounded-lg flex items-center justify-center transition-colors',
          'aria-selected:bg-green-100 aria-selected:text-green-600 aria-selected:font-medium aria-selected:shadow-sm',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected: 'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600',
        day_today:
          'bg-green-600 text-white hover:bg-green-600 hover:text-white rounded-lg shadow-sm',
        day_outside: 'text-gray-300',
        day_disabled: 'text-gray-300',
        day_range_middle: 'aria-selected:bg-green-50',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('h-4 w-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
