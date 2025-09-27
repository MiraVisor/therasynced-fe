'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

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
              'flex w-full justify-between items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm font-normal text-foreground h-11 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
              !date && 'text-gray-400',
            )}
          >
            {date ? format(date, 'dd/MM/yyyy') : 'Select date'}
            <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
          <input
            type="date"
            value={
              date
                ? [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, '0'),
                    String(date.getDate()).padStart(2, '0'),
                  ].join('-')
                : ''
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const [year, month, day] = val.split('-').map(Number);
                const selectedDate = new Date(year, month - 1, day);
                handleDateChange(selectedDate);
              } else {
                handleDateChange(undefined);
              }
            }}
            min="1900-01-01"
            max={(() => {
              const today = new Date();
              const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
              return [
                maxDate.getFullYear(),
                String(maxDate.getMonth() + 1).padStart(2, '0'),
                String(maxDate.getDate()).padStart(2, '0'),
              ].join('-');
            })()}
            className="rounded-md border border-gray-300 px-3 py-2 w-full h-11 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
