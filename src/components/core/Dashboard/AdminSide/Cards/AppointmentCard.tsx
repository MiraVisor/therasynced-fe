import React from 'react';

import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';

export type AppointmentStatus = 'in-progress' | 'scheduled' | 'cancelled';

interface AppointmentCardProps {
  name: string;
  time: string;
  condition: string;
  status: AppointmentStatus;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  name,
  time,
  condition,
  status,
}) => {
  const statusStyles = {
    'in-progress': 'bg-success/10 text-success border-success/20',
    scheduled: 'bg-info/10 text-info border-info/20',
    cancelled: 'bg-error/10 text-error border-error/20',
  };

  const statusLabels = {
    'in-progress': 'In progress',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
  };

  return (
    <EnhancedCard variant="default" className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-inter font-medium text-sm text-foreground">{name}</h4>
          <p className="font-open-sans text-xs text-muted-foreground mt-1">
            {time} | {condition}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('px-3 py-1.5 text-xs font-inter', statusStyles[status])}
        >
          {statusLabels[status]}
        </Badge>
      </div>
    </EnhancedCard>
  );
};
