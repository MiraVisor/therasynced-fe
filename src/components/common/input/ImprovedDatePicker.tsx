'use client';

import * as React from 'react';
import { format, getMonth, getYear, setDate, setMonth, setYear } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ImprovedDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: boolean;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function ImprovedDatePicker({
  value,
  onChange,
  error,
  placeholder = 'DD/MM/YYYY',
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: ImprovedDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [textInput, setTextInput] = React.useState('');

  const today = new Date();
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxYear = minAge.getFullYear();
  const minYear = 1900;

  // Generate years for dropdown (from 1900 to maxYear)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Initialize text input when value changes
  React.useEffect(() => {
    if (value) {
      setTextInput(format(value, 'dd/MM/yyyy'));
    } else {
      setTextInput('');
    }
  }, [value]);

  // Handle text input change
  const handleTextInputChange = (input: string) => {
    // Only allow numbers and /
    let cleanInput = input.replace(/[^\d/]/g, '');

    // Auto-format as user types (DD/MM/YYYY)
    if (cleanInput.length <= 10) {
      if (cleanInput.length === 2 && !cleanInput.includes('/')) {
        cleanInput = `${cleanInput}/`;
      } else if (cleanInput.length === 5 && cleanInput.split('/').length === 2) {
        cleanInput = `${cleanInput}/`;
      }

      setTextInput(cleanInput);

      // Try to parse the date when we have full input
      if (cleanInput.length === 10) {
        const parts = cleanInput.split('/');
        if (parts.length === 3) {
          const dayStr = parts[0];
          const monthStr = parts[1];
          const yearStr = parts[2];
          if (!dayStr || !monthStr || !yearStr) return;
          const day = parseInt(dayStr, 10);
          const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
          const year = parseInt(yearStr, 10);

          if (
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year) &&
            day >= 1 &&
            day <= 31 &&
            month >= 0 &&
            month <= 11 &&
            year >= minYear &&
            year <= maxYear
          ) {
            const selectedDate = new Date(year, month, day);

            // Validate the date is valid and within range
            if (
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month &&
              selectedDate.getDate() === day &&
              selectedDate <= minAge &&
              selectedDate >= new Date(minYear, 0, 1)
            ) {
              if (onChange) {
                onChange(selectedDate);
              }
              return;
            }
          }
        }
      }
    }

    // If input is empty, clear the date
    if (cleanInput === '') {
      if (onChange) {
        onChange(undefined);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date instanceof Date) {
      if (onChange) {
        onChange(date);
      }
      setOpen(false);
    }
  };

  const [selectedMonth, setSelectedMonth] = React.useState<Date>(() => {
    if (value) {
      return new Date(value.getFullYear(), value.getMonth(), 1);
    }
    return new Date(minAge.getFullYear(), minAge.getMonth(), 1);
  });

  React.useEffect(() => {
    if (value) {
      setSelectedMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    }
  }, [value]);

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year, 10);
    const currentMonthNum = value ? getMonth(value) : getMonth(selectedMonth);
    const newMonth = new Date(yearNum, currentMonthNum, 1);

    // Update the calendar view
    setSelectedMonth(newMonth);

    // If we have a value, update it
    if (value) {
      const newDate = setYear(value, yearNum);
      // Clamp date if needed
      if (newDate > minAge) {
        onChange?.(minAge);
        setSelectedMonth(new Date(minAge.getFullYear(), minAge.getMonth(), 1));
      } else {
        onChange?.(newDate);
      }
    } else {
      // Just update the month view for now
      if (newMonth <= minAge) {
        setSelectedMonth(newMonth);
      }
    }
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) return;

    const currentYear = value ? getYear(value) : getYear(selectedMonth);
    const newMonth = new Date(currentYear, monthIndex, 1);

    // Update the calendar view
    setSelectedMonth(newMonth);

    if (value) {
      const newDate = setMonth(value, monthIndex);
      // Ensure date is valid
      const daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
      const day = Math.min(value.getDate(), daysInMonth);
      const finalDate = setDate(newDate, day);
      if (finalDate <= minAge) {
        onChange?.(finalDate);
      }
    }
  };

  const currentMonth = value ? months[getMonth(value)] : months[getMonth(selectedMonth)];
  const currentYear = value ? getYear(value).toString() : getYear(selectedMonth).toString();

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        value={textInput}
        onChange={(e) => handleTextInputChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || 'Date of birth'}
        aria-invalid={ariaInvalid || error}
        aria-describedby={ariaDescribedBy}
        className={cn(
          'w-full h-10 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-sm font-inter',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:border-primary',
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Year and Month Selectors */}
            <div className="flex gap-2">
              <Select value={currentYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[120px] h-10 font-inter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="font-inter">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={currentMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px] h-10 font-inter flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month} className="font-inter">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > minAge || date < new Date(minYear, 0, 1)}
              month={selectedMonth}
              onMonthChange={(date) => setSelectedMonth(date)}
              captionLayout="label">
              initialFocus
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
