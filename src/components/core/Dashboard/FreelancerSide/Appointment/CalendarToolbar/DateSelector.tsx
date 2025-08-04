import { format, getYear, setYear } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setSelectedDate } from '@/redux/slices/calendarSlice';
import { RootState } from '@/redux/store';

export const DateSelector = () => {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((state: RootState) => state.calendar);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleYearChange = (year: string) => {
    const newDate = setYear(selectedDate, parseInt(year));
    dispatch(setSelectedDate(newDate));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      dispatch(setSelectedDate(date));
    }
  };

  const renderDateSelector = () => {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Select value={getYear(selectedDate).toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ShadcnCalendar
          mode="single"
          selected={new Date(selectedDate)}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {format(selectedDate, 'PPP')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto p-0">
        {renderDateSelector()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
