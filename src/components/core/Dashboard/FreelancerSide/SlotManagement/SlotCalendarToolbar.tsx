'use client';

import { endOfWeek, format, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { View } from 'react-big-calendar';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SlotCalendarToolbarProps {
  view: View;
  onView: (view: View) => void;
  selectedDate: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
}

export const SlotCalendarToolbar = ({
  view,
  onView,
  selectedDate,
  onNavigate,
}: SlotCalendarToolbarProps) => {
  const getViewLabel = () => {
    switch (view) {
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'week': {
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
      case 'day':
        return format(selectedDate, 'MMMM d, yyyy');
      default:
        return format(selectedDate, 'PPP');
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate('PREV')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate('NEXT')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="outline" className="ml-2" onClick={() => onNavigate('TODAY')}>
              Today
            </Button>
            <span className="ml-2 text-2xl font-medium">{getViewLabel()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value: View) => onView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex lg:hidden items-center gap-4">
            <Button variant="outline" onClick={() => onNavigate('TODAY')}>
              Today
            </Button>
          </div>
        </div>
        <span className="ml-2 truncate font-medium display lg:hidden">{getViewLabel()}</span>
      </div>
    </div>
  );
};
