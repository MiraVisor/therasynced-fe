'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  title?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ title, value, onChange }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <div className="w-full space-y-1">
      {title && (
        <label className="font-[700] text-[14px] leading-[25px] font-sans text-foreground">
          {title}
        </label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex w-full justify-between items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm font-normal text-muted-foreground bg-background text-foreground h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500',
              !date && 'text-gray-400',
            )}
          >
            {date ? format(date, 'dd/MM/yyyy') : 'Select date'}
            <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            autoFocus
            captionLayout="dropdown"
            disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
