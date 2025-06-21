import { Badge } from '@/components/ui/badge';
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

interface ActiveFiltersProps {
  filters: CalendarToolbarProps['filters'];
}

export const ActiveFilters = ({ filters }: ActiveFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.showOnlyUpcoming && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Upcoming
        </Badge>
      )}
      {filters.showOnlyPast && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Past
        </Badge>
      )}
      {filters.hideCompleted && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Hide Completed
        </Badge>
      )}
      {filters.hideCancelled && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Hide Cancelled
        </Badge>
      )}
    </div>
  );
};
