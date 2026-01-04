import * as React from 'react';

import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
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
  sparklineData?: number[];
  interactive?: boolean;
  onClick?: () => void;
  loading?: boolean;
  bookingSkeleton?: boolean;
  variant?: 'default' | 'rating';
  rating?: number;
  reviewCount?: number;
  alwaysShowSkeleton?: boolean;
  simple?: boolean;
}

export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  trend,
  sparklineData,
  interactive = false,
  onClick,
  loading = false,
  bookingSkeleton = false,
  variant = 'default',
  rating,
  reviewCount,
  alwaysShowSkeleton = false,
  simple = false,
  className,
  ...props
}) => {
  if (loading || alwaysShowSkeleton) {
    if (variant === 'rating') {
      return (
        <EnhancedCard
          variant="default"
          interactive={interactive}
          onClick={onClick}
          className={cn('group', className)}
          {...props}
        >
          <div className="p-6 space-y-4">
            {/* Header with title */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-inter font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-2">
                    {/* Skeleton for RatingDisplay */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                        ))}
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />{' '}
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />{' '}
                    </div>
                  </div>
                  {/* Skeleton for trend */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
                </div>
                {/* Skeleton for label */}
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mt-1" />
              </div>
            </div>

            {/* Sparkline chart skeleton */}
            <div className="pt-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-full" />
            </div>
          </div>
        </EnhancedCard>
      );
    }
    return (
      <EnhancedStatCardSkeleton
        bookingSkeleton={bookingSkeleton}
        hasSparkline={sparklineData && sparklineData.length > 0}
        simple={simple}
      />
    );
  }

  if (variant === 'rating') {
    return (
      <EnhancedCard
        variant="default"
        interactive={interactive}
        onClick={onClick}
        className={cn('group', className)}
        {...props}
      >
        <div className="p-6 space-y-4">
          {/* Header with title */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-inter font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <div className="flex items-center gap-2">
                  <RatingDisplay
                    rating={rating}
                    reviewCount={reviewCount}
                    size="md"
                    showCount={true}
                  />
                </div>
                {trend && (
                  <div
                    className={cn(
                      'text-xs font-medium',
                      trend.isUp ? 'text-success' : 'text-error',
                    )}
                  >
                    {trend.isUp ? '+' : ''}
                    {Math.abs(trend.value).toFixed(1)}%
                  </div>
                )}
              </div>
              {trend?.label && <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>}
            </div>
          </div>

          {/* Sparkline chart */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="pt-2">
              <Sparkline data={sparklineData} color="#007745" width={100} height={30} />
            </div>
          )}
        </div>
      </EnhancedCard>
    );
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
        {/* Header with title */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-inter font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'font-poppins font-bold text-foreground',
                  value.length > 12 ? 'text-lg' : value.length > 6 ? 'text-xl' : 'text-3xl',
                )}
              >
                {value}
              </span>

              {trend && (
                <div
                  className={cn('text-xs font-medium', trend.isUp ? 'text-success' : 'text-error')}
                >
                  {trend.isUp ? '+' : ''}
                  {Math.abs(trend.value).toFixed(1)}%
                </div>
              )}
            </div>
            {trend?.label && <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>}
          </div>
        </div>

        {/* Sparkline chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="pt-2">
            <Sparkline data={sparklineData} color="#007745" width={100} height={30} />
          </div>
        )}
      </div>
    </EnhancedCard>
  );
};
