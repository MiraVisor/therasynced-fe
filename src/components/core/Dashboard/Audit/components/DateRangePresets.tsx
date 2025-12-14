'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export type DatePreset = 'today' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePresetsProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: { label: string; value: DatePreset; getRange: () => DateRange }[] = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { from: today, to: today };
    },
  },
  {
    label: 'Last 7 days',
    value: 'last7',
    getRange: () => {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  {
    label: 'Last 30 days',
    value: 'last30',
    getRange: () => {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setDate(from.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  {
    label: 'Last 90 days',
    value: 'last90',
    getRange: () => {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setDate(from.getDate() - 90);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  {
    label: 'This month',
    value: 'thisMonth',
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      from.setHours(0, 0, 0, 0);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    },
  },
  {
    label: 'Last month',
    value: 'lastMonth',
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      from.setHours(0, 0, 0, 0);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    },
  },
];

export function DateRangePresets({ value, onChange, className }: DateRangePresetsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getRange();
    onChange(range);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!value.from && !value.to) {
      return 'Select date range';
    }
    if (value.from && value.to) {
      if (value.from.getTime() === value.to.getTime()) {
        return format(value.from, 'MMM d, yyyy');
      }
      return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
    }
    if (value.from) {
      return `From ${format(value.from, 'MMM d, yyyy')}`;
    }
    if (value.to) {
      return `Until ${format(value.to, 'MMM d, yyyy')}`;
    }
    return 'Select date range';
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value.from && !value.to && 'text-muted-foreground',
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDateRange()}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-left font-normal"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <CalendarComponent
            mode="range"
            selected={{ from: value.from, to: value.to }}
            onSelect={(range) => {
              if (range) {
                onChange({
                  from: range.from,
                  to: range.to || range.from,
                });
              }
            }}
            numberOfMonths={2}
            className="rounded-md border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
