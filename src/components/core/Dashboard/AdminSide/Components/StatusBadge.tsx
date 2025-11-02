import React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'WARNED'
  | 'SUSPENDED';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
    variant: 'outline',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/20',
    variant: 'outline',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-error/10 text-error border-error/20',
    variant: 'outline',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
    variant: 'outline',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-muted',
    variant: 'outline',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-info/10 text-info border-info/20',
    variant: 'outline',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-success/10 text-success border-success/20',
    variant: 'outline',
  },
  DISMISSED: {
    label: 'Dismissed',
    className: 'bg-muted text-muted-foreground border-muted',
    variant: 'outline',
  },
  WARNED: {
    label: 'Warned',
    className: 'bg-warning/10 text-warning border-warning/20',
    variant: 'outline',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'bg-error/10 text-error border-error/20',
    variant: 'outline',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-muted',
    variant: 'outline' as const,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-inter font-medium border',
        config.className,
        sizeClasses[size],
        className,
      )}
    >
      {config.label}
    </Badge>
  );
};
