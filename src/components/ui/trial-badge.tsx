'use client';

import { format } from 'date-fns';
import { Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrialBadgeProps {
  trialEndsAt: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const TrialBadge: React.FC<TrialBadgeProps> = ({ trialEndsAt, size = 'sm', className }) => {
  if (!trialEndsAt) return null;

  const formatTrialEndDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'Expired';
      } else if (diffDays === 0) {
        return 'Ends today';
      } else if (diffDays === 1) {
        return 'Ends tomorrow';
      } else if (diffDays <= 7) {
        return `Ends in ${diffDays} days`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch {
      return format(new Date(dateString), 'MMM d, yyyy');
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
        sizeClasses[size],
        className,
      )}
    >
      <Clock className={cn(iconSizeClasses[size], 'flex-shrink-0')} />
      <span>Trial • {formatTrialEndDate(trialEndsAt)}</span>
    </Badge>
  );
};

export default TrialBadge;
