import { ArrowDown, ArrowUp, LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { EnhancedCard } from './enhanced-card';
import { EnhancedStatCardSkeleton } from './skeletons/EnhancedStatCardSkeleton';
import { Sparkline } from './sparkline';

export interface EnhancedStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  trend?: {
    value: number;
    isUp: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sparklineData?: number[];
  interactive?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  sparklineData,
  interactive = false,
  onClick,
  loading = false,
  className,
  ...props
}) => {
  if (loading) {
    return <EnhancedStatCardSkeleton />;
  }

  return (
    <EnhancedCard
      variant="default"
      interactive={interactive}
      onClick={onClick}
      className={cn('group', className)}
      {...props}
    >
      <div className="p-6 space-y-4">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-inter font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-poppins font-bold text-foreground">{value}</span>
              {trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    trend.isUp ? 'text-success' : 'text-error',
                  )}
                >
                  {trend.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(trend.value).toFixed(1)}%
                </div>
              )}
            </div>
            {trend?.label && <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>}
          </div>
          <div
            className={cn(
              'p-3 rounded-2xl transition-all duration-300',
              iconBg,
              interactive && 'group-hover:scale-110',
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>

        {/* Sparkline chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="pt-2">
            <Sparkline
              data={sparklineData}
              color={iconColor.replace('text-', '#').replace('primary', '007745')}
              width={100}
              height={30}
            />
          </div>
        )}
      </div>
    </EnhancedCard>
  );
};
