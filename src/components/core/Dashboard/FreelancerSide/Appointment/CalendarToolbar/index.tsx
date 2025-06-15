'use client';

import { endOfWeek, format, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { navigateToNext, navigateToPrev, setSelectedDate } from '@/redux/slices/calendarSlice';
import { RootState } from '@/redux/store';
import { View } from '@/types/types';

import { ActiveFilters } from './ActiveFilters';
import { DateSelector } from './DateSelector';
import { FilterSelector } from './FilterSelector';
import { ViewSelector } from './ViewSelector';

interface CalendarToolbarProps {
  view: View;
  onView: (view: View) => void;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => void;
  filters: {
    hideCompleted: boolean;
    hideCancelled: boolean;
    showOnlyUpcoming: boolean;
    showOnlyPast: boolean;
  };
  onFilterChange: (filters: Partial<CalendarToolbarProps['filters']>) => void;
}

export const CalendarToolbar = ({
  view,
  onView,
  filters,
  onFilterChange,
}: CalendarToolbarProps) => {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((state: RootState) => state.calendar);

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
            onClick={() => {
              dispatch(navigateToPrev());
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <DateSelector />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              dispatch(navigateToNext());
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => {
                const today = new Date();
                dispatch(setSelectedDate(today));
              }}
            >
              Today
            </Button>
            <span className="ml-2 text-2xl font-medium">{getViewLabel()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewSelector view={view} onView={onView} />
          <FilterSelector filters={filters} onFilterChange={onFilterChange} />
        </div>
        <div className="flex lg:hidden items-center gap-4">
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => {
              const today = new Date();
              dispatch(setSelectedDate(today));
            }}
          >
            Today
          </Button>
          <span className="ml-2 truncate font-medium">{getViewLabel()}</span>
        </div>
      </div>
      <ActiveFilters filters={filters} />
    </div>
  );
};
