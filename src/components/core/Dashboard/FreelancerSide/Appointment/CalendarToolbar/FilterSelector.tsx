import { Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { View } from '@/types/types';

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

interface FilterSelectorProps {
  filters: CalendarToolbarProps['filters'];
  onFilterChange: CalendarToolbarProps['onFilterChange'];
}

export const FilterSelector = ({ filters, onFilterChange }: FilterSelectorProps) => {
  const handleFilterToggle = (key: keyof CalendarToolbarProps['filters']) => {
    onFilterChange({ [key]: !filters[key] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleFilterToggle('hideCompleted')}>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`h-2 w-2 rounded-full ${
                filters.hideCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            Hide Completed
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterToggle('hideCancelled')}>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`h-2 w-2 rounded-full ${
                filters.hideCancelled ? 'bg-red-500' : 'bg-gray-300'
              }`}
            />
            Hide Cancelled
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterToggle('showOnlyUpcoming')}>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`h-2 w-2 rounded-full ${
                filters.showOnlyUpcoming ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            Show Only Upcoming
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterToggle('showOnlyPast')}>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`h-2 w-2 rounded-full ${
                filters.showOnlyPast ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            />
            Show Only Past
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
