import { LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { View } from '@/types/types';

interface ViewSelectorProps {
  view: View;
  onView: (view: View) => void;
}

export const ViewSelector = ({ view, onView }: ViewSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView('month')}>Month</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView('week')}>Week</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView('day')}>Day</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
