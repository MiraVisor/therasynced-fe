import * as React from 'react';

import { cn } from '@/lib/utils';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  greeting?: string;
  name?: string;
  subtitle?: string;
  quickStats?: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  greeting,
  name,
  subtitle,
  quickStats,
  isLoading = false,
  className,
  ...props
}) => {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayGreeting = greeting || getTimeBasedGreeting();

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)} {...props}>
        {/* Welcome Section Skeleton */}
        <div className="space-y-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700/30 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded animate-pulse w-1/2" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-mint/50 to-white rounded-xl p-4 border border-sage/30 overflow-hidden relative"
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700/20 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-12 mb-2" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-poppins font-bold text-foreground">
          {displayGreeting}
          {name && <span className="text-primary">, {name}</span>}
        </h1>
        {subtitle && <p className="text-base font-inter text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Quick Stats */}
      {quickStats && quickStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-mint/50 to-white rounded-xl p-4 border border-sage/30"
            >
              <div className="text-xs font-inter font-medium text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xl font-poppins font-semibold text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
