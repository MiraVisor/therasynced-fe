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
        <label className="block text-foreground font-semibold text-[18px] mb-1">{title}</label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex w-full justify-between items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-left text-sm font-normal text-muted-foreground bg-background text-foreground',
              !date && 'text-gray-400',
            )}
          >
            {date ? format(date, 'dd/MM/yy') : 'DD/MM/YY'}
            <CalendarIcon className="ml-2 h-5 w-5 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}
