import { ArrowRight, Users } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface ViewMoreButtonProps {
  onClick?: () => void;
  totalCount?: number;
  displayedCount?: number;
}

export const ViewMoreButton: React.FC<ViewMoreButtonProps> = ({
  onClick,
  totalCount = 0,
  displayedCount = 0,
}) => {
  const remainingCount = totalCount - displayedCount;

  return (
    <div className="flex justify-center pt-8">
      <Button
        variant="outline"
        className="border-primary/20 text-primary hover:bg-primary/5 px-8 py-3 h-auto"
        onClick={onClick}
      >
        <Users className="w-4 h-4 mr-2" />
        View {remainingCount > 0 ? `${remainingCount} More` : 'All'} Therapists
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
