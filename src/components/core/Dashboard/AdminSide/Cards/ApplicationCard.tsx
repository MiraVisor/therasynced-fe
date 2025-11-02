import React from 'react';

import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';

interface ApplicationCardProps {
  name: string;
  specialty: string;
  onReview: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ name, specialty, onReview }) => {
  return (
    <EnhancedCard variant="default" className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-inter font-medium text-sm text-foreground">{name}</h4>
          <p className="font-open-sans text-xs text-muted-foreground mt-1">{specialty}</p>
        </div>
        <Button onClick={onReview} size="sm" className="font-inter font-medium text-xs">
          Review
        </Button>
      </div>
    </EnhancedCard>
  );
};
